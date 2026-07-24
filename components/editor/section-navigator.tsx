'use client';

import type { TemplateSectionId } from '@/lib/template-engine';

export const SECTION_META: Record<TemplateSectionId,{title:string;description:string;icon:string}> = {
  hero:{title:'Portada',description:'Presentación principal',icon:'✦'},
  intro:{title:'Introducción',description:'Mensaje para invitados',icon:'“'},
  countdown:{title:'Cuenta regresiva',description:'Tiempo para el evento',icon:'◷'},
  details:{title:'Detalles',description:'Fecha, lugar y vestimenta',icon:'i'},
  program:{title:'Programa',description:'Itinerario y horarios',icon:'≡'},
  gallery:{title:'Galería',description:'Fotografías y recuerdos',icon:'▧'},
  history:{title:'Nuestra historia',description:'Relato y storytelling',icon:'♡'},
  lodging:{title:'Hospedaje',description:'Hoteles y recomendaciones',icon:'⌂'},
  gifts:{title:'Mesa de regalos',description:'Opciones de regalos',icon:'♢'},
  video:{title:'Video',description:'Mensaje o recuerdo audiovisual',icon:'▶'},
  faq:{title:'Preguntas frecuentes',description:'Dudas de los invitados',icon:'?'},
  location:{title:'Ubicación',description:'Dirección y mapa',icon:'⌖'},
  rsvp:{title:'Confirmación RSVP',description:'Asistencia de invitados',icon:'✓'}
};

type Props = {
  order: TemplateSectionId[];
  selected: TemplateSectionId;
  modalidad: 'simple'|'rsvp'|'pases';
  isEnabled: (section: TemplateSectionId)=>boolean;
  onSelect: (section: TemplateSectionId)=>void;
};

export default function SectionNavigator({order,selected,modalidad,isEnabled,onSelect}:Props){
  const activeCount=order.filter(section=>isEnabled(section) && !(section==='rsvp'&&modalidad==='simple')).length;
  return <aside className="visual-builder-navigator" aria-label="Secciones de la invitación">
    <div className="visual-builder-navigator-heading">
      <div><span>Constructor visual</span><strong>Componentes</strong></div>
      <em>{activeCount}/{order.length}</em>
    </div>
    <p>Selecciona un bloque para editar sus propiedades.</p>
    <nav className="visual-builder-component-list">
      {order.map((section,index)=>{
        const meta=SECTION_META[section];
        const unavailable=section==='rsvp'&&modalidad==='simple';
        const enabled=isEnabled(section)&&!unavailable;
        const current=selected===section;
        return <button
          type="button"
          key={section}
          className={`${current?'active':''} ${enabled?'enabled':'disabled'}`}
          onClick={()=>onSelect(section)}
          aria-current={current?'true':undefined}
        >
          <span className="visual-builder-component-order">{String(index+1).padStart(2,'0')}</span>
          <span className="visual-builder-component-icon">{meta.icon}</span>
          <span className="visual-builder-component-copy"><strong>{meta.title}</strong><small>{unavailable?'Disponible con RSVP o Pases':meta.description}</small></span>
          <span className="visual-builder-component-state" title={enabled?'Visible':'Oculta'}>{enabled?'●':'○'}</span>
        </button>
      })}
    </nav>
    <div className="visual-builder-navigator-tip"><span>Pro</span><p>El punto sólido indica que el bloque está visible en la invitación.</p></div>
  </aside>
}
