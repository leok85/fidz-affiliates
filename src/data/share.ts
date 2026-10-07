import type { AffiliateProfile, Caption } from '../types';

export function referralUrl(profile: AffiliateProfile) {
  return `https://${profile.link}`;
}

export function captionsFor(profile: AffiliateProfile): Caption[] {
  const { code, link } = profile;
  return [
    {
      where: 'Post no feed',
      text: `Tem loja e quer que o cliente volte mais vezes? Com a Fidz você cria sua fidelidade com selos, pontos ou cashback e acompanha tudo pelo celular. Cadastre sua loja com o código ${code}: ${link}`
    },
    { where: 'Story e bio', text: `Fidelidade para sua loja: selos, pontos ou cashback. Código ${code} → ${link}` },
    {
      where: 'WhatsApp',
      text: `Oi! Conhece a Fidz? É um app de fidelidade para lojas: você escolhe se dá selos, pontos ou cashback, e o cliente acompanha pelo celular. Se quiser testar, cadastra com meu código ${code}: ${link}`
    }
  ];
}

export function whatsappShareUrl(profile: AffiliateProfile) {
  const text = captionsFor(profile).find((c) => c.where === 'WhatsApp')!.text;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
