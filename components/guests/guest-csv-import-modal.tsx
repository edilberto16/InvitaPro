'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Invitacion } from '@/lib/invitapro';
import { messageFromError, randomCode } from '@/lib/invitapro';

type CsvRow = {
  row: number;
  nombre: string;
  telefono: string;
  correo: string;
  adultos: number;
  ninos: number;
  mesa: string;
  codigo: string;
  notas: string;
  error?: string;
};

type Props = {
  open: boolean;
  invitations: Invitacion[];
  onClose: () => void;
  onImported: () => Promise<void> | void;
};

const HEADER_ALIASES: Record<string, keyof Omit<CsvRow,'row'|'error'>> = {
  nombre:'nombre', invitado:'nombre', familia:'nombre', name:'nombre',
  telefono:'telefono', teléfono:'telefono', celular:'telefono', phone:'telefono', whatsapp:'telefono',
  correo:'correo', email:'correo', 'correo electrónico':'correo',
  adultos:'adultos', 'adultos permitidos':'adultos', adult:'adultos',
  ninos:'ninos', niños:'ninos', menores:'ninos', children:'ninos',
  mesa:'mesa', table:'mesa',
  codigo:'codigo', código:'codigo', code:'codigo',
  notas:'notas', nota:'notas', notes:'notas'
};

function normalizeHeader(value:string){
  return value.trim().toLowerCase().replace(/^\ufeff/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ');
}

function detectDelimiter(line:string){
  const candidates=[',',';','\t'];
  return candidates.map(delimiter=>({delimiter,count:line.split(delimiter).length})).sort((a,b)=>b.count-a.count)[0].delimiter;
}

function parseCsvLine(line:string,delimiter:string){
  const values:string[]=[];
  let value='';
  let quoted=false;
  for(let i=0;i<line.length;i++){
    const char=line[i];
    if(char==='"'){
      if(quoted&&line[i+1]==='"'){value+='"';i++;}
      else quoted=!quoted;
    }else if(char===delimiter&&!quoted){values.push(value.trim());value='';}
    else value+=char;
  }
  values.push(value.trim());
  return values;
}

function parseCsv(text:string):CsvRow[]{
  const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(line=>line.trim());
  if(lines.length<2)return [];
  const delimiter=detectDelimiter(lines[0]);
  const headers=parseCsvLine(lines[0],delimiter).map(value=>HEADER_ALIASES[normalizeHeader(value)]);
  return lines.slice(1).map((line,index)=>{
    const values=parseCsvLine(line,delimiter);
    const raw:Record<string,string>={};
    headers.forEach((header,column)=>{if(header)raw[header]=values[column]?.trim()??''});
    const adultos=raw.adultos===''?1:Number(raw.adultos);
    const ninos=raw.ninos===''?0:Number(raw.ninos);
    const nombre=raw.nombre?.trim()??'';
    const errors:string[]=[];
    if(!nombre)errors.push('Falta el nombre');
    if(!Number.isInteger(adultos)||adultos<0)errors.push('Adultos inválido');
    if(!Number.isInteger(ninos)||ninos<0)errors.push('Niños inválido');
    if(Number.isInteger(adultos)&&Number.isInteger(ninos)&&adultos+ninos<1)errors.push('Debe tener al menos un lugar');
    if(raw.correo&&!/^\S+@\S+\.\S+$/.test(raw.correo))errors.push('Correo inválido');
    return {row:index+2,nombre,telefono:raw.telefono??'',correo:raw.correo??'',adultos,ninos,mesa:raw.mesa??'',codigo:(raw.codigo??'').toUpperCase(),notas:raw.notas??'',error:errors.join(' · ')||undefined};
  });
}

export default function GuestCsvImportModal({open,invitations,onClose,onImported}:Props){
  const supabase=useMemo(()=>createClient(),[]);
  const[invitacionId,setInvitacionId]=useState(invitations[0]?.id??'');
  const[fileName,setFileName]=useState('');
  const[rows,setRows]=useState<CsvRow[]>([]);
  const[error,setError]=useState('');
  const[importing,setImporting]=useState(false);
  const validRows=rows.filter(row=>!row.error);

  if(!open)return null;

  function reset(){setFileName('');setRows([]);setError('');}
  function close(){if(importing)return;reset();onClose();}

  async function readFile(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    setError('');
    if(!file.name.toLowerCase().endsWith('.csv'))return setError('Selecciona un archivo con extensión .csv.');
    if(file.size>2_000_000)return setError('El archivo es demasiado grande. El límite es 2 MB.');
    const parsed=parseCsv(await file.text());
    if(!parsed.length)return setError('No encontramos registros. Verifica que el archivo incluya encabezados y al menos un invitado.');
    setFileName(file.name);
    setRows(parsed);
  }

  function downloadTemplate(){
    const csv='nombre,telefono,correo,adultos,ninos,mesa,codigo,notas\nFamilia López,9991234567,familia@ejemplo.com,2,1,Mesa 8,,Amigos de la familia\nMaría Pérez,9997654321,,1,0,Mesa 3,,Vegetariana';
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download='plantilla-invitados-invitapro.csv';anchor.click();URL.revokeObjectURL(url);
  }

  async function importRows(){
    if(!invitacionId)return setError('Selecciona la invitación a la que pertenecen los invitados.');
    if(!validRows.length)return setError('No hay registros válidos para importar.');
    setImporting(true);setError('');
    const used=new Set<string>();
    const payload=validRows.map(row=>{
      let code=row.codigo.trim()||randomCode();
      while(used.has(code))code=randomCode();
      used.add(code);
      return {invitacion_id:invitacionId,nombre:row.nombre,telefono:row.telefono||null,correo:row.correo||null,adultos_permitidos:row.adultos,ninos_permitidos:row.ninos,mesa:row.mesa||null,codigo:code,estado:'pendiente' as const,notas:row.notas||null};
    });
    for(let index=0;index<payload.length;index+=200){
      const result=await supabase.from('invitados').insert(payload.slice(index,index+200));
      if(result.error){setImporting(false);return setError(messageFromError(result.error));}
    }
    setImporting(false);await onImported();close();
  }

  return <div className="modal-backdrop" onMouseDown={close}>
    <section className="modal-card csv-import-modal" onMouseDown={event=>event.stopPropagation()}>
      <header className="modal-header">
        <div><p className="eyebrow">Carga masiva</p><h2>Importar invitados desde CSV</h2><p>Sube tu lista, revisa los registros y crea todos los pases en una sola operación.</p></div>
        <button type="button" className="modal-close" aria-label="Cerrar" onClick={close}>×</button>
      </header>
      <div className="csv-import-body">
        <section className="csv-import-setup">
          <label className="form-field"><span>Invitación *</span><select value={invitacionId} onChange={event=>setInvitacionId(event.target.value)}><option value="">Selecciona una invitación</option>{invitations.map(item=><option key={item.id} value={item.id}>{item.titulo}</option>)}</select></label>
          <div className="csv-import-actions"><label className="button button-primary csv-file-button">Seleccionar archivo<input type="file" accept=".csv,text/csv" onChange={readFile}/></label><button type="button" className="button button-outline" onClick={downloadTemplate}>Descargar plantilla</button></div>
          <p className="csv-import-hint">Columnas aceptadas: nombre, teléfono, correo, adultos, niños, mesa, código y notas. Solo <strong>nombre</strong> es obligatorio.</p>
          {fileName&&<div className="csv-selected-file"><span>✓</span><div><strong>{fileName}</strong><small>{rows.length} registros encontrados</small></div><button type="button" onClick={reset}>Quitar</button></div>}
        </section>
        {rows.length>0&&<section className="csv-preview-section">
          <div className="csv-preview-summary"><div><strong>Vista previa</strong><span>{validRows.length} listos · {rows.length-validRows.length} con observaciones</span></div></div>
          <div className="table-wrap csv-preview-table"><table className="data-table"><thead><tr><th>Fila</th><th>Invitado</th><th>Contacto</th><th>Pases</th><th>Mesa</th><th>Resultado</th></tr></thead><tbody>{rows.slice(0,100).map(row=><tr key={row.row} className={row.error?'csv-row-error':''}><td>{row.row}</td><td><strong>{row.nombre||'Sin nombre'}</strong></td><td>{row.telefono||row.correo||'—'}</td><td>{Number.isFinite(row.adultos)?row.adultos:'—'} adultos · {Number.isFinite(row.ninos)?row.ninos:'—'} niños</td><td>{row.mesa||'—'}</td><td>{row.error?<span className="csv-status error">{row.error}</span>:<span className="csv-status ready">Listo</span>}</td></tr>)}</tbody></table></div>
          {rows.length>100&&<p className="csv-preview-limit">Se muestran los primeros 100 registros. Se importarán todos los registros válidos.</p>}
        </section>}
        {error&&<p className="form-error">{error}</p>}
      </div>
      <footer className="guest-form-footer"><button type="button" className="button button-ghost" onClick={close}>Cancelar</button><button type="button" className="button button-primary" disabled={importing||!validRows.length} onClick={importRows}>{importing?'Importando…':`Importar ${validRows.length||''} invitados`}</button></footer>
    </section>
  </div>;
}
