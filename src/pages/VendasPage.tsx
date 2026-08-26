import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, Package, RefreshCw, X } from 'lucide-react'
import { getApiErrorMessage } from '../services/api'
import { getTransaction, getTransactions } from '../services/transactions'
import type { TransactionDetail, TransactionSummary } from '../types/transactions'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export default function VendasPage() {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setTransactions(await getTransactions())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar as vendas agora.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  async function showTransactionDetail(transactionId: string) {
    setIsLoadingDetail(true)
    setError(null)

    try {
      setSelectedTransaction(await getTransaction(transactionId))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível carregar os itens da venda.'))
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6c786f]">Relatórios</p>
          <h1 className="mt-1 text-3xl font-bold text-[#183c34]">Vendas</h1>
        </div>
        <button
          type="button"
          onClick={() => void loadTransactions()}
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

      <div className="overflow-hidden border border-[#d8d0c2] bg-white">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm font-medium text-[#5e675f]">Carregando vendas...</div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center text-[#5e675f]">
            <Package size={30} className="mb-3 text-[#849088]" />
            <p className="font-semibold text-[#183c34]">Nenhuma venda registrada.</p>
            <p className="mt-1 text-sm">As compras concluídas no CageOuts aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-[#edf3ee] text-xs uppercase tracking-[0.08em] text-[#526158]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Horário</th>
                  <th className="px-5 py-3 font-semibold">Checkout</th>
                  <th className="px-5 py-3 font-semibold">Itens</th>
                  <th className="px-5 py-3 text-right font-semibold">Valor total</th>
                  <th className="w-24 px-5 py-3 text-right font-semibold">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-[#e8e2d7] text-sm text-[#3e4a42]">
                    <td className="px-5 py-4 font-medium">{formatDate(transaction.completedAt)}</td>
                    <td className="px-5 py-4">{transaction.checkoutId}</td>
                    <td className="px-5 py-4">{transaction.itemCount}</td>
                    <td className="px-5 py-4 text-right font-semibold text-[#183c34]">{formatCurrency(transaction.totalAmount)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void showTransactionDetail(transaction.id)}
                        className="text-sm font-semibold text-[#1f6553] hover:text-[#123d33]"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(selectedTransaction || isLoadingDetail) && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#11231e]/35 px-4 py-6" role="presentation">
          <section className="max-h-full w-full max-w-2xl overflow-auto border border-[#cfc6b7] bg-[#fdfbf7] shadow-2xl" role="dialog" aria-modal="true" aria-label="Itens da venda">
            <div className="flex items-center justify-between border-b border-[#d8d0c2] px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[#183c34]">Detalhe da venda</p>
                {selectedTransaction && <p className="mt-1 text-sm text-[#5e675f]">{selectedTransaction.checkoutId} · {formatDate(selectedTransaction.completedAt)}</p>}
              </div>
              <button type="button" onClick={() => setSelectedTransaction(null)} className="flex h-9 w-9 items-center justify-center text-[#536057] hover:bg-[#edf3ee]" aria-label="Fechar detalhe">
                <X size={19} />
              </button>
            </div>

            {isLoadingDetail || !selectedTransaction ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-[#5e675f]">Carregando itens...</div>
            ) : (
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-[#d8d0c2] text-xs uppercase tracking-[0.08em] text-[#647168]">
                      <tr>
                        <th className="pb-3 font-semibold">Item</th>
                        <th className="pb-3 font-semibold">Código</th>
                        <th className="pb-3 text-right font-semibold">Qtd.</th>
                        <th className="pb-3 text-right font-semibold">Unitário</th>
                        <th className="pb-3 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items.map((item) => (
                        <tr key={`${item.productCode}-${item.unitPrice}`} className="border-b border-[#ece6db] text-[#3e4a42]">
                          <td className="py-3 font-medium">{item.productName}</td>
                          <td className="py-3 text-[#657168]">{item.productCode}</td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-right font-semibold text-[#183c34]">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 flex justify-end border-t border-[#d8d0c2] pt-4 text-base font-bold text-[#183c34]">
                  Total: {formatCurrency(selectedTransaction.totalAmount)}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  )
}
