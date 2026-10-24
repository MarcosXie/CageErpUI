import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CirclePlay,
  Mail,
  MapPin,
  MessageCircle,
  Scale,
  ShoppingCart,
} from 'lucide-react'
import './ApresentacaoPage.css'

const videoUrl = '/media/CageOuts-Promo.mp4'
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Av. Manuel Bandeira, 360, Vila Leopoldina, São Paulo - SP, 05317-020',
)}`
const demoMessage = encodeURIComponent(
  'Olá! Vi a apresentação da CageOuts e gostaria de agendar uma demo para conhecer a empresa e seu ecossistema de self-checkout para grandes compras no atacarejo. Quais são os horários disponíveis?',
)
const demoEmailUrl = `mailto:cageouts@gmail.com?subject=${encodeURIComponent('Agendamento de demo | CageOuts')}&body=${demoMessage}`
const contacts = [
  { name: 'André', phone: '(41) 99717-5818', number: '5541997175818' },
  { name: 'Marcos', phone: '(11) 93749-6956', number: '5511937496956' },
]

export default function ApresentacaoPage() {
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const previousTitle = document.title
    const previousLanguage = document.documentElement.lang
    document.title = 'CageOuts | Um novo jeito de transformar o atacarejo'
    document.documentElement.lang = 'pt-BR'

    return () => {
      document.title = previousTitle
      document.documentElement.lang = previousLanguage
    }
  }, [])

  return (
    <div className="presentation-page">
      <meta
        name="description"
        content="Agende uma demo e conheça a CageOuts: ecossistema completo de self-checkout para grandes compras no atacarejo, com validação de imagem e peso e monitoramento em tempo real."
      />
      <a className="presentation-skip-link" href="#conteudo">Pular para o conteúdo</a>

      <header className="presentation-header presentation-container">
        <a className="presentation-brand" href="#inicio" aria-label="CageOuts — início">
          <img src="/branding/logo-cageouts.png" alt="CageOuts" width="574" height="460" />
          <span>Um novo olhar para o atacarejo.</span>
        </a>
        <nav aria-label="Navegação da apresentação">
          <a className="presentation-nav-link" href="#solucao">O ecossistema</a>
          <a className="presentation-nav-link" href="#visita">Visite a CageOuts</a>
          <a className="presentation-nav-contact" href="#contato">
            Agende uma demo <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="conteudo">
        <section id="inicio" className="presentation-hero presentation-container" aria-labelledby="presentation-title">
          <div className="presentation-hero-copy">
            <p className="presentation-slogan">O <strong>Próximo</strong> passo do seu atacarejo.</p>
            <h1 id="presentation-title">
              Carrinho cheio.<br />
              Self-checkout <em>completo.</em>
            </h1>
            <p className="presentation-intro">
              Somos a <strong>CageOuts</strong>. Mais do que uma máquina,
              oferecemos um ecossistema completo de self-checkout pensado para
              grandes compras no atacarejo. Conectamos autoatendimento,
              validação por imagem e peso e monitoramento em tempo real
              para a gestão.
            </p>
            <div className="presentation-hero-actions">
              <a className="presentation-button presentation-button-primary" href="#contato">
                <CalendarDays size={20} aria-hidden="true" /> Agende uma demo
              </a>
              <a className="presentation-text-link" href="#filme">
                <CirclePlay size={18} aria-hidden="true" /> Conheça em vídeo
              </a>
            </div>
            <p className="presentation-invitation-note">Conheça nossa empresa e veja o ecossistema de perto.</p>
          </div>

          <figure id="filme" className="presentation-film">
            <div className="presentation-film-heading">
              <span><span className="presentation-status-dot" /> CAGEOUTS EM AÇÃO</span>
              <span>FILME DE APRESENTAÇÃO</span>
            </div>
            <video
              controls
              playsInline
              preload="none"
              poster="/media/cageouts-promo-poster.jpg"
              src={videoUrl}
              aria-label="Vídeo promocional CageOuts"
              aria-describedby="presentation-video-caption"
              onError={(event) => {
                console.error('Não foi possível carregar o vídeo CageOuts.', event.currentTarget.error)
                setVideoError(true)
              }}
            >
              Seu navegador não suporta este vídeo. <a href={videoUrl}>Abra o vídeo diretamente.</a>
            </video>
            {videoError && (
              <p className="presentation-video-error" role="alert">
                Não foi possível carregar o vídeo. Tente abri-lo pelo link abaixo
                ou fale com nossa equipe.
              </p>
            )}
            <figcaption id="presentation-video-caption">
              <div>
                <strong>O self-checkout pensado para carrinhos cheios.</strong>
                <span>Dê o play e conheça a proposta da CageOuts para o atacarejo.</span>
              </div>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir vídeo em uma nova aba">
                <ArrowUpRight size={22} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>

          <a className="presentation-explore" href="#solucao">
            Conheça nosso ecossistema <ArrowDown size={16} aria-hidden="true" />
          </a>
        </section>

        <section id="solucao" className="presentation-solution presentation-container" aria-labelledby="solution-title">
          <div className="presentation-section-heading">
            <p className="presentation-eyebrow">Do carrinho à gestão</p>
            <h2 id="solution-title">Mais que uma máquina.<br />Um ecossistema completo.</h2>
            <p>
              Equipamento, software, validação e monitoramento trabalhando
              juntos. Uma solução que conecta a jornada de compra à gestão
              da operação, com foco na realidade do atacarejo.
            </p>
          </div>
          <div className="presentation-benefits">
            <article>
              <ShoppingCart size={28} strokeWidth={1.5} aria-hidden="true" />
              <h3>Self-checkout para grandes compras</h3>
              <p>
                Carrinhos cheios não deveriam ficar de fora do autoatendimento.
                Nosso foco é permitir que compras de grande volume passem pelo
                self-checkout, enfrentando uma das principais barreiras do
                modelo tradicional no atacarejo.
              </p>
            </article>
            <article>
              <Scale size={28} strokeWidth={1.5} aria-hidden="true" />
              <h3>Validação por imagem e peso</h3>
              <p>
                Combinamos validação de imagem e conferência de peso durante
                a compra. Duas camadas de verificação integradas ao
                autoatendimento para apoiar o controle dos produtos.
              </p>
            </article>
            <article>
              <ChartNoAxesCombined size={28} strokeWidth={1.5} aria-hidden="true" />
              <h3>Monitoramento em tempo real</h3>
              <p>
                A gestão acompanha as compras enquanto elas acontecem.
                Monitoramento em tempo real, informações de vendas e
                ocorrências em um mesmo ecossistema para dar visibilidade
                à operação e apoiar decisões.
              </p>
            </article>
          </div>
        </section>

        <section id="visita" className="presentation-visit presentation-container" aria-labelledby="visit-title">
          <div className="presentation-visit-copy">
            <p className="presentation-eyebrow">Um convite especial</p>
            <h2 id="visit-title">O melhor jeito de<br />conhecer é <em>de perto.</em></h2>
            <p>
              Agende uma demonstração com nossa equipe para conhecer a
              CageOuts e nosso ecossistema de self-checkout. Veja de perto
              como conectamos grandes compras, validação e gestão para
              transformar o atacarejo.
            </p>
            <a className="presentation-button presentation-button-light" href="#contato">
              Agendar minha demo <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>
          <div className="presentation-address">
            <MapPin size={30} strokeWidth={1.5} aria-hidden="true" />
            <p className="presentation-eyebrow">Esperamos por você</p>
            <address>
              <strong>Av. Manuel Bandeira, 360</strong>
              <span>Vila Leopoldina · São Paulo – SP</span>
              <span>CEP: 05317-020</span>
            </address>
            <a className="presentation-text-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no Google Maps <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section id="contato" className="presentation-contact presentation-container" aria-labelledby="contact-title">
          <div className="presentation-contact-heading">
            <div>
              <p className="presentation-eyebrow">Conheça a CageOuts de perto</p>
              <h2 id="contact-title">Agende uma demo<br /><em>conosco.</em></h2>
            </div>
            <p>Escolha um dos contatos abaixo e combine o melhor horário com nossa equipe. Vamos apresentar nossa empresa e mostrar o ecossistema completo para o seu atacarejo.</p>
          </div>
          <div className="presentation-contact-grid">
            {contacts.map((contact) => (
              <a
                key={contact.number}
                className="presentation-contact-card"
                href={`https://wa.me/${contact.number}?text=${demoMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Agendar uma demo com ${contact.name} pelo WhatsApp: ${contact.phone}`}
              >
                <MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" />
                <span className="presentation-contact-detail">
                  <span>Agendar demo · {contact.name}</span>
                  <strong>{contact.phone}</strong>
                </span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            ))}
            <a className="presentation-contact-card" href={demoEmailUrl}>
              <Mail size={25} strokeWidth={1.5} aria-hidden="true" />
              <span className="presentation-contact-detail">
                <span>Agendar demo por e-mail</span>
                <strong>cageouts@gmail.com</strong>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="presentation-footer presentation-container">
        <a href="#inicio" aria-label="CageOuts — voltar ao início">Cage<span>Outs</span><span className="presentation-footer-dot">.</span></a>
        <p>Um ecossistema completo para transformar o atacarejo.</p>
        <span>São Paulo · Brasil</span>
      </footer>
    </div>
  )
}
