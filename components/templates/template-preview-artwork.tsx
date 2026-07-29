import { TEMPLATE_COLLECTIONS, type TemplateDefinition } from '@/lib/template-catalog';

function collectionName(template: TemplateDefinition) {
  return TEMPLATE_COLLECTIONS.find((item) => item.id === template.collection)?.label ?? template.collection;
}

export default function TemplatePreviewArtwork({ template, large = false }: { template: TemplateDefinition; large?: boolean }) {
  const label = collectionName(template);
  return (
    <div className={`template-artwork template-artwork-${template.layout} ${large ? 'is-large' : ''}`} aria-hidden="true">
      <span className="art-shape art-shape-one" />
      <span className="art-shape art-shape-two" />
      <span className="art-shape art-shape-three" />
      <span className="art-spark art-spark-one">✦</span>
      <span className="art-spark art-spark-two">✧</span>
      <span className="art-icon">
        {template.layout === 'camp-forest' ? '🏕️' : template.layout === 'camp-fire' ? '🔥' : template.layout === 'camp-mountain' ? '🏔️' : template.layout === 'camp-sunrise' ? '🌅' : template.layout === 'camp-stars' ? '✦' : template.layout === 'camp-trail' ? '🥾' : template.layout === 'camp-revival' ? '⚡' : template.layout === 'space' ? '🪐' : template.layout === 'dino' ? '🦖' : template.layout === 'unicorn' ? '🦄' : template.layout === 'safari' ? '🦁' : template.layout === 'hero' ? '⚡' : template.layout === 'butterfly' ? '🦋' : template.collection === 'empresarial' ? '◆' : template.collection === 'xv' ? '♕' : '❦'}
      </span>
      <span className="art-kicker">{template.familyName || label}</span>
      <strong>{template.name}</strong>
      <i />
      <em>{template.variantName || (template.collection === 'campamento' ? 'Fe · amistad · aventura' : template.collection === 'empresarial' ? 'Ideas que conectan' : template.collection === 'infantil' ? 'Una aventura inolvidable' : template.collection === 'xv' ? 'Mis quince años' : 'Nuestra historia')}</em>
    </div>
  );
}
