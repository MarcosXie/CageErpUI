import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleAlert, Fingerprint, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { updateEmployeeFingerprint } from '../services/employees'
import {
  cancelFingerprintEnrollment,
  checkFingerprintBridgeHealth,
  getFingerprintEnrollmentStatus,
  startFingerprintEnrollment,
} from '../services/fingerprintBridge'

const POLL_INTERVAL_MS = 700
const MAX_POLL_ATTEMPTS = Math.ceil(30_000 / POLL_INTERVAL_MS)

interface FingerprintEnrollDialogProps {
  employeeId: string
  employeeName: string
  onClose: () => void
  onSaved: () => void
}

type Step = 'checking-bridge' | 'bridge-offline' | 'ready' | 'capturing' | 'saving' | 'error'

export default function FingerprintEnrollDialog({ employeeId, employeeName, onClose, onSaved }: FingerprintEnrollDialogProps) {
  const [step, setStep] = useState<Step>('checking-bridge')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollAttemptsRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const checkBridge = useCallback(async () => {
    setStep('checking-bridge')
    try {
      const healthy = await checkFingerprintBridgeHealth()
      setStep(healthy ? 'ready' : 'bridge-offline')
    } catch {
      setStep('bridge-offline')
    }
  }, [])

  const saveTemplate = useCallback(
    async (template: string) => {
      setStep('saving')
      try {
        await updateEmployeeFingerprint(employeeId, template)
        onSaved()
      } catch (requestError) {
        setErrorMessage(getApiErrorMessage(requestError, 'Digital capturada, mas não foi possível salvar no servidor.'))
        setStep('error')
      }
    },
    [employeeId, onSaved],
  )

  const handleStartCapture = useCallback(async () => {
    setErrorMessage(null)
    setStep('capturing')

    try {
      await startFingerprintEnrollment()
    } catch (requestError) {
      setErrorMessage(getApiErrorMessage(requestError, 'Não foi possível iniciar a captura no agente local.'))
      setStep('error')
      return
    }

    pollAttemptsRef.current = 0
    pollTimerRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        stopPolling()
        setErrorMessage('Tempo esgotado aguardando a leitura da digital. Tente novamente.')
        setStep('error')
        return
      }

      try {
        const status = await getFingerprintEnrollmentStatus()
        if (status.status === 'Success' && status.template) {
          stopPolling()
          await saveTemplate(status.template)
        } else if (status.status === 'Failed') {
          stopPolling()
          setErrorMessage(status.errorMessage || 'Falha ao capturar a digital.')
          setStep('error')
        }
      } catch {
        stopPolling()
        setErrorMessage('Perdemos a conexão com o agente local durante a captura.')
        setStep('error')
      }
    }, POLL_INTERVAL_MS)
  }, [saveTemplate, stopPolling])

  const handleCancel = useCallback(async () => {
    stopPolling()
    try {
      await cancelFingerprintEnrollment()
    } catch {
      // Best-effort: o agente local pode já ter concluído a captura.
    }
    setStep('ready')
  }, [stopPolling])

  // Fetch-on-mount (same intent as FuncionariosPage's loadData); rule appears to false-positive here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkBridge()
  }, [checkBridge])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#11231e]/35 px-4 py-6" role="presentation">
      <section className="w-full max-w-sm border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label="Configurar digital">
        <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
          <p className="text-sm font-semibold text-[#183c34]">Configurar digital — {employeeName}</p>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar">
            <X size={19} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <Fingerprint size={48} className="text-[#1f6553]" />

          {step === 'checking-bridge' && <p className="text-sm text-[#5e675f]">Verificando agente local do leitor...</p>}

          {step === 'bridge-offline' && (
            <div className="w-full space-y-2">
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#8c2d1c]">
                <CircleAlert size={17} /> Agente local não encontrado
              </p>
              <p className="text-sm text-[#5e675f]">
                Abra o programa <strong>FingerprintBridge</strong> no computador onde o leitor Hamster DX está conectado e tente novamente.
              </p>
              <button
                type="button"
                onClick={() => void checkBridge()}
                className="mt-2 border border-[#1f6553] bg-[#1f6553] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d33]"
              >
                Verificar novamente
              </button>
            </div>
          )}

          {step === 'ready' && (
            <div className="w-full space-y-3">
              <p className="text-sm text-[#5e675f]">Peça para o funcionário se aproximar do leitor e clique em iniciar.</p>
              <button
                type="button"
                onClick={() => void handleStartCapture()}
                className="w-full border border-[#1f6553] bg-[#1f6553] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d33]"
              >
                Iniciar captura
              </button>
            </div>
          )}

          {step === 'capturing' && (
            <div className="w-full space-y-3">
              <p className="text-sm font-semibold text-[#183c34]">Coloque o dedo no leitor...</p>
              <p className="text-xs text-[#5e675f]">Siga as instruções que aparecerem na tela do leitor.</p>
              <button
                type="button"
                onClick={() => void handleCancel()}
                className="w-full border border-[#b9c7bd] bg-white px-4 py-2 text-sm font-semibold text-[#183c34] hover:bg-[#edf3ee]"
              >
                Cancelar
              </button>
            </div>
          )}

          {step === 'saving' && <p className="text-sm text-[#5e675f]">Salvando digital...</p>}

          {step === 'error' && (
            <div className="w-full space-y-2">
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#8c2d1c]">
                <CircleAlert size={17} /> {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => void handleStartCapture()}
                className="w-full border border-[#1f6553] bg-[#1f6553] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123d33]"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
