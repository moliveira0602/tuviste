import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/context/LanguageContext';

export default function ContactoPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  // ... (manter o resto dos estados) ...
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // ... (manter as funções) ...
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!consentAccepted) {
      alert('Por favor, aceite os termos de consentimento para continuar.');
      return;
    }
    
    if (parseInt(captchaInput) !== num1 + num2) {
      alert('A resposta do cálculo está incorreta. Por favor, tente novamente.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    alert(`Obrigado pelo seu contacto, ${formData.name}! A sua mensagem foi recebida.`);
    setFormData({ name: '', email: '', message: '' });
    setCaptchaInput('');
    setConsentAccepted(false);
    generateCaptcha();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6"><MessageSquare className="w-8 h-8 text-white" /></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('contactPage.title')}</h1>
          <p className="text-xl text-blue-100 leading-relaxed">{t('contactPage.subtitle')}</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-blue-900 text-2xl">{t('contactPage.formTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold">{t('contactPage.nameLabel')}</Label>
                  <Input id="name" type="text" value={formData.name} onChange={handleChange} required placeholder={t('contactPage.nameLabel')} className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="seu.email@exemplo.com" className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-gray-700 font-semibold">{t('contactPage.messageLabel')}</Label>
                  <Textarea id="message" value={formData.message} onChange={handleChange} required rows={5} placeholder={t('contactPage.messageLabel')} className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <Label htmlFor="captcha" className="text-gray-700 font-semibold">{t('contactPage.captchaLabel')}</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gray-100 px-4 py-2 rounded-md font-mono text-lg">{num1} + {num2} = ?</span>
                    <Input id="captcha" type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required placeholder="Resultado" className="border-gray-300 flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={generateCaptcha}><RefreshCw className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Checkbox id="consent" checked={consentAccepted} onCheckedChange={setConsentAccepted} className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">{t('contactPage.consentLabel')}</label>
                  </div>
                </div>
                <Button type="submit" disabled={!consentAccepted} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"><Send className="w-5 h-5 mr-2" />{t('contactPage.submitButton')}</Button>
              </form>
            </CardContent>
          </Card>
          {/* Manter o restante do conteúdo da página */}
          <div className="space-y-8">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                <CardTitle className="text-green-900 text-2xl">Informações de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-blue-600" /></div>
                  <div><h3 className="text-lg font-semibold mb-1">Email</h3><p className="text-gray-600 mb-2">Para questões gerais ou de imprensa</p><a href="mailto:redacao@tuviste.pt" className="text-blue-600 hover:text-blue-800 font-medium">redacao@tuviste.pt</a></div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-green-600" /></div>
                  <div><h3 className="text-lg font-semibold mb-1">Telefone</h3><p className="text-gray-600 mb-2">Disponível de Seg. a Sex. das 9h às 18h</p><a href="tel:+351210000000" className="text-blue-600 hover:text-blue-800 font-medium">+351 21 000 0000</a></div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-purple-600" /></div>
                  <div><h3 className="text-lg font-semibold mb-1">Escritório</h3><p className="text-gray-600">Avenida da Liberdade, 123<br/>Lisboa, Portugal</p></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardContent className="p-8 text-center"><Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Tempo de Resposta</h3><p className="text-gray-700">Respondemos normalmente no prazo de <span className="font-semibold text-orange-600">24 horas</span> em dias úteis</p></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}