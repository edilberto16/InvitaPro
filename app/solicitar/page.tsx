import {Suspense} from "react";
import SolicitarForm from "./solicitar-form";
export default function SolicitarPage(){
 return <Suspense fallback={<main className="request-page"><div className="marketing-container" style={{padding:"100px 20px",textAlign:"center"}}>Preparando tu solicitud…</div></main>}><SolicitarForm/></Suspense>;
}
