import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, FileText, Users, Cookie, ExternalLink, CheckCircle } from "lucide-react";

export default function GDPRCompliancePage() {
  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conformidade GDPR & Legal</h1>
          <p className="text-gray-600 mt-1">Garantia de conformidade com o Regulamento Geral de Proteção de Dados e direitos autorais.</p>
        </div>

        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Shield className="w-6 h-6 text-green-600" /></div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Sistema Totalmente Conforme</h3>
              <p className="text-green-700">Todas as funcionalidades respeitam os requisitos do GDPR e de direitos autorais.</p>
            </div>
            <Badge className="bg-green-600 text-white ml-auto flex-shrink-0"><CheckCircle className="w-4 h-4 mr-1" />Certificado</Badge>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ComplianceItemCard title="Coleta de Dados" icon={<Eye className="text-blue-600" />} items={["Coleta mínima necessária", "Consentimento explícito", "Finalidade específica", "Base legal definida"]} />
          <ComplianceItemCard title="Segurança" icon={<Lock className="text-purple-600" />} items={["Encriptação de dados", "Acesso controlado por função", "Monitorização de segurança", "Backups seguros e regulares"]} />
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-orange-600" />Direitos dos Titulares de Dados</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Direitos Implementados</h4>
              <div className="space-y-2">
                {["Direito de acesso", "Direito de retificação", "Direito ao apagamento", "Direito à portabilidade"].map(item => <CheckItem key={item}>{item}</CheckItem>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Procedimentos</h4>
              <div className="space-y-2">
                {["Resposta em até 30 dias", "Verificação de identidade segura", "Processo totalmente gratuito", "Documentação completa de pedidos"].map(item => <CheckItem key={item}>{item}</CheckItem>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader><CardTitle className="flex items-center"><Cookie className="w-5 h-5 mr-2 text-amber-600" />Gestão de Cookies</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Sistema de gestão de consentimento implementado para cookies, com granularidade e transparência:</p>
            <div className="grid md:grid-cols-3 gap-4">
              <CookieCard type="Essenciais" description="Necessários para o funcionamento do site" status="Sempre Ativos" statusColor="green" />
              <CookieCard type="Analytics" description="Estatísticas de utilização anónimas" status="Opcional" statusColor="blue" />
              <CookieCard type="Publicidade" description="Monetização do conteúdo" status="Opcional" statusColor="purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-600" />Direitos Autorais e Conteúdo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-900 mb-2">⚖️ Práticas Legais e Fair Use</h5>
                    <ul className="text-yellow-800 text-sm space-y-1 pl-4 list-disc">
                        <li>Todo o conteúdo gerado por IA é uma obra original e reescrita, não uma cópia.</li>
                        <li>Fontes são usadas como inspiração e para verificação de fatos, com atribuição clara.</li>
                        <li>Links diretos para as fontes originais são sempre fornecidos.</li>
                        <li>O sistema adiciona valor através de análise, resumo e contextualização.</li>
                        <li>Todo o conteúdo passa por revisão e aprovação editorial antes de ser publicado.</li>
                    </ul>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacto para Questões de Privacidade</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Encarregado de Proteção de Dados (DPO):</strong><p className="text-gray-600">dpo@tuviste.pt</p></div>
            <div><strong>Autoridade de Supervisão:</strong><p className="text-gray-600">Comissão Nacional de Proteção de Dados (CNPD) <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800"><ExternalLink className="w-4 h-4 inline" /></a></p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ComplianceItemCard = ({ title, icon, items }) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center">{icon} {title}</CardTitle></CardHeader>
    <CardContent><div className="space-y-3">{items.map(item => <CheckItem key={item}>{item}</CheckItem>)}</div></CardContent>
  </Card>
);

const CheckItem = ({ children }) => (
  <div className="flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-700">{children}</span></div>
);

const CookieCard = ({ type, description, status, statusColor }) => (
  <div className={`bg-${statusColor}-50 p-4 rounded-lg`}>
    <h5 className={`font-semibold text-${statusColor}-900 mb-2`}>{type}</h5>
    <p className={`text-sm text-${statusColor}-700`}>{description}</p>
    <Badge className={`mt-2 bg-${statusColor}-600 text-white`}>{status}</Badge>
  </div>
);