import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, AlertTriangle, HeartPulse, Shield, Flame, UserCheck, PhoneIncoming } from 'lucide-react';

const usefulNumbers = [
  { name: 'SNS 24', number: '808 24 24 24', icon: <HeartPulse className="w-5 h-5 text-blue-600" /> },
  { name: 'Apoio à Vítima', number: '116 006', icon: <UserCheck className="w-5 h-5 text-green-600" /> },
  { name: 'Incêndios Florestais', number: '117', icon: <Flame className="w-5 h-5 text-orange-600" /> },
  { name: 'Polícia (PSP/GNR)', number: '21 346 61 41', icon: <Shield className="w-5 h-5 text-gray-700" /> },
];

export default function UsefulNumbersWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-semibold text-gray-800">
          <PhoneIncoming className="w-4 h-4 mr-2" />
          Números Úteis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destaque para o 112 */}
        <div className="bg-red-100 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center text-red-600 mb-1">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">Emergência</span>
          </div>
          <a href="tel:112" className="text-4xl font-extrabold text-red-700 hover:text-red-800 transition-colors">
            112
          </a>
        </div>

        {/* Outros números */}
        <div className="space-y-3 pt-2">
          {usefulNumbers.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2 text-gray-700">{item.name}</span>
              </div>
              <a href={`tel:${item.number.replace(/\s/g, '')}`} className="font-bold text-gray-900 hover:text-blue-700 transition-colors">
                {item.number}
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}