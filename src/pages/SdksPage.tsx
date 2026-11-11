import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Download, Package, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getSdkDownload, getSdks } from '../services/sdks'
import type { SdkAppResponseDto, SdkReleaseResponseDto } from '../types/sdks'

const appDescriptions: Record<string, string> = {
  CageOuts: 'Aplicação de self-checkout (WPF) instalada em cada Cage.',
  CageCluster: 'Aplicação CageCluster para Windows.',
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function formatSize(bytes: number): string {
  if (!bytes) return '-'
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date)
}

export default function SdksPage() {
  const [apps, setApps] = useState<SdkAppResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setApps(await getSdks())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os instaladores.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleDownload(release: SdkReleaseResponseDto) {
    const key = `${release.app}/${release.version}`
    setDownloadingKey(key)
    setError(null)

    try {
      const download = await getSdkDownload(release.app, release.version)
      const link = document.createElement('a')
      link.href = download.url
      link.download = download.fileName
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, `Não foi possível baixar ${release.app} ${release.version}.`))
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Downloads</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">SDKs</h1>
          <p className="mt-1 text-sm text-[#5e675f]">Instaladores Windows disponíveis para cada aplicação, por versão.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="flex h-10 items-center gap-2 border border-[#b9c7bd] bg-white px-3 text-sm font-semibold text-[#183c34] transition-colors hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 border border-[#f2b8aa] bg-[#fff1ed] px-4 py-3 text-sm text-[#8c2d1c]" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && apps.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center border border-[#d8d0c2] bg-white text-sm font-medium text-[#5e675f]">
          Carregando instaladores...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {apps.map((app) => {
            const selectedVersion = selectedVersions[app.app] ?? app.latestVersion ?? ''
            const selectedRelease = app.releases.find((r) => r.version === selectedVersion)

            return (
              <article key={app.app} className="border border-[#d8d0c2] bg-white">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e2d7] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#edf3ee] text-[#183c34]">
                      <Package size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#183c34]">{app.app}</h2>
                      <p className="text-sm text-[#5e675f]">{appDescriptions[app.app] ?? 'Instalador Windows.'}</p>
                    </div>
                  </div>

                  {app.releases.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor={`version-${app.app}`} className="text-sm font-semibold text-[#183c34]">
                        Versão:
                      </label>
                      <select
                        id={`version-${app.app}`}
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersions((current) => ({ ...current, [app.app]: e.target.value }))}
                        className="h-10 border border-[#b9c7bd] bg-white px-3 text-sm text-[#183c34]"
                      >
                        {app.releases.map((release) => (
                          <option key={release.version} value={release.version}>
                            {release.version}
                            {release.version === app.latestVersion ? ' (mais recente)' : ''} — {formatDate(release.releaseDate)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => selectedRelease && void handleDownload(selectedRelease)}
                        disabled={!selectedRelease || downloadingKey !== null}
                        className="flex h-10 items-center gap-2 border border-[#1f6553] bg-[#1f6553] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download size={17} />
                        Baixar
                      </button>
                    </div>
                  )}
                </header>

                {app.releases.length === 0 ? (
                  <div className="flex min-h-32 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
                    <p className="font-semibold text-[#183c34]">Nenhuma versão publicada.</p>
                    <p className="mt-1 text-sm">Publique um instalador com o script publish-sdk.ps1.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left">
                      <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Versão</th>
                          <th className="px-5 py-3 font-semibold">Data de release</th>
                          <th className="px-5 py-3 font-semibold">Arquivo</th>
                          <th className="px-5 py-3 font-semibold">Tamanho</th>
                          <th className="w-32 px-5 py-3 text-right font-semibold">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {app.releases.map((release) => {
                          const key = `${release.app}/${release.version}`
                          const isDownloading = downloadingKey === key

                          return (
                            <tr key={key} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                              <td className="px-5 py-4 font-semibold text-[#183c34]">
                                {release.version}
                                {release.version === app.latestVersion && (
                                  <span className="ml-2 inline-block rounded bg-[#dcfce7] px-2 py-0.5 text-xs font-semibold text-[#166534]">
                                    Mais recente
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4">{formatDate(release.releaseDate)}</td>
                              <td className="px-5 py-4 font-mono text-[#657168]" title={release.sha256 ? `SHA-256: ${release.sha256}` : undefined}>
                                {release.fileName}
                              </td>
                              <td className="px-5 py-4">{formatSize(release.sizeBytes)}</td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => void handleDownload(release)}
                                  disabled={downloadingKey !== null}
                                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f6553] hover:text-[#123d33] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Download size={16} className={isDownloading ? 'animate-pulse' : ''} />
                                  {isDownloading ? 'Gerando...' : 'Baixar'}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
