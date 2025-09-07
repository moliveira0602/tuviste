import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, BrainCircuit, ShieldCheck, Globe, Users, Award, Clock, CheckCircle } from 'lucide-react';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre o Tuviste?
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            A sua fonte de notícias inteligente, em tempo real, que respeita a sua privacidade e a veracidade da informação.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center text-blue-900">
                <BrainCircuit className="w-6 h-6 mr-3" />
                A Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Num mundo inundado de informação, a nossa missão é simples: fornecer notícias precisas, relevantes e de fontes credíveis, de forma rápida e acessível.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos tecnologia de ponta para agregar, reescrever e contextualizar as notícias mais importantes, garantindo sempre a originalidade e o respeito pelos direitos autorais.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center text-green-900">
                <Globe className="w-6 h-6 mr-3" />
                Como Funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                O nosso sistema de IA monitoriza constantemente as principais fontes de notícias nacionais e internacionais.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Verifica a veracidade e a fonte da informação</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Reescreve o conteúdo de forma original</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Gera imagens relevantes quando necessário</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Disponibiliza com link para a fonte original</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-blue-600">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">50K+</div>
            <div className="text-sm text-gray-600">Leitores Diários</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-green-600">
            <Newspaper className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">1000+</div>
            <div className="text-sm text-gray-600">Artigos Publicados</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-purple-600">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-600">Atualizações</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-orange-600">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Conteúdo Original</div>
          </div>
        </div>

        {/* Commitment Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O Nosso Compromisso
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Credibilidade e conformidade com a GDPR são os nossos pilares. Todo o conteúdo é criado com respeito pelas fontes originais e pelos seus dados pessoais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}