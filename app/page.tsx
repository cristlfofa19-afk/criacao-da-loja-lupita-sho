'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight, CreditCard, Menu, MessageCircle, Play, Search, ShieldCheck, Sparkles, WalletCards, X, Zap } from 'lucide-react'

const whatsapp = '5531982941291'
const categories = ['Todas', 'Diamantes', 'Contas', 'Skins', 'Gift Cards']

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [search, setSearch] = useState('')

  const openWhatsApp = () => window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Vim pelo catálogo da LUPITA SHOPEE e quero fazer um pedido.')}`, '_blank')

  return (
    <main className="lupita-site">
      <div className="noise" />
      <header className="topbar">
        <Link href="/" className="brand-lockup"><span className="brand-mark">L</span><span>LUPITA <b>SHOPEE</b></span></Link>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a href="#catalogo" onClick={() => setMenuOpen(false)}>CATÁLOGO</a>
          <a href="#ofertas" onClick={() => setMenuOpen(false)}>OFERTAS</a>
          <a href="#novidades" onClick={() => setMenuOpen(false)}>NOVIDADES</a>
          <Link href="/admin">PAINEL ADM</Link>
        </nav>
        <button className="menu-button" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> EXPERIÊNCIA DIGITAL PREMIUM</div>
          <h1>SEU UNIVERSO.<br /><em>SEU JOGO.</em><br />SUA LUPITA.</h1>
          <p className="hero-lede">Itens digitais, recargas e benefícios para você jogar no próximo nível. Atendimento humano, entrega rápida e uma estética feita para quem não passa despercebido.</p>
          <div className="hero-actions"><a className="primary-cta" href="#catalogo">VER CATÁLOGO <ArrowRight /></a><button className="ghost-cta" onClick={openWhatsApp}><MessageCircle /> FALAR AGORA</button></div>
          <div className="hero-stats"><div><strong>24/7</strong><span>ATENDIMENTO</span></div><div><strong>PIX</strong><span>APROVAÇÃO RÁPIDA</span></div><div><strong>100%</strong><span>CONFIÁVEL</span></div></div>
        </div>
        <div className="hero-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-label label-top">LUPITA<br /><span>ONLINE</span></div><div className="portrait-frame"><Image src="/lupita-character.jpg" alt="Personagem futurista da LUPITA SHOPEE" fill priority sizes="(max-width: 700px) 92vw, 600px" /></div><div className="art-tag"><Sparkles /> DROP 001</div><div className="art-corner">01<br /><span>/ 04</span></div></div>
      </section>

      <section className="signal-strip"><span>ACESSO IMEDIATO</span><i /> <span>SUPORTE NO WHATSAPP</span><i /> <span>PAGAMENTO SEGURO</span><i /> <span>ENTREGA DIGITAL</span></section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading"><div><span className="eyebrow">CENTRAL DE COMANDO</span><h2>ESCOLHA SUA <em>PRÓXIMA FASE</em></h2></div><div className="search-box"><Search /><input placeholder="Buscar no catálogo" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="category-row">{categories.map(category => <button key={category} className={activeCategory === category ? 'category active' : 'category'} onClick={() => setActiveCategory(category)}>{category}<ChevronRight /></button>)}</div>
        <div className="empty-catalog"><div className="empty-icon"><Zap /></div><span className="eyebrow">CATÁLOGO EM CONSTRUÇÃO</span><h3>Seu catálogo começa aqui.</h3><p>Adicione seus produtos, fotos e vídeos pelo painel administrativo. Esta vitrine fica pronta para receber a sua operação.</p><Link href="/admin" className="secondary-cta">ABRIR PAINEL <ArrowRight /></Link></div>
      </section>

      <section className="feature-band" id="ofertas"><div className="feature-number">01</div><div><span className="eyebrow">LUPITA CHECK-IN</span><h2>FINALIZE PELO<br /><em>WHATSAPP</em></h2><p>Escolha seu produto, confira o pedido e fale direto com a nossa equipe. O pagamento pode ser configurado para PIX, cartão, PayPal ou boleto.</p><button className="primary-cta" onClick={openWhatsApp}>INICIAR CHECK-IN <ArrowRight /></button></div><div className="payment-orb"><WalletCards /><span>PIX</span><span>CARD</span><span>PAYPAL</span></div></section>

      <section className="trust-grid" id="novidades"><div className="trust-card"><ShieldCheck /><div><strong>Compra assistida</strong><span>Você envia o comprovante diretamente na conversa.</span></div></div><div className="trust-card"><CreditCard /><div><strong>Pagamento flexível</strong><span>Configure juros e métodos no painel.</span></div></div><div className="trust-card"><Play /><div><strong>Conteúdo vivo</strong><span>Publique novidades com fotos e vídeos.</span></div></div></section>

      <footer><div className="brand-lockup"><span className="brand-mark">L</span><span>LUPITA <b>SHOPEE</b></span></div><span>CATÁLOGO DIGITAL PREMIUM</span><a href={`https://wa.me/${whatsapp}`} target="_blank">WHATSAPP <ArrowRight /></a></footer>
      <button className="whatsapp-float" aria-label="Falar no WhatsApp" onClick={openWhatsApp}><MessageCircle /></button>
    </main>
  )
}
