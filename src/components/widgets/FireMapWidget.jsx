import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Flame, MapPin, Users, Truck } from "lucide-react";

// Custom icon for fire markers
const fireSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="orange" stroke="red" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const fireIconUrl = `data:image/svg+xml;base64,${btoa(fireSvgIcon)}`;
const fireIcon = new L.Icon({
  iconUrl: fireIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function FireMapWidget() {
  const [fires, setFires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFireData = async () => {
      try {
        const firePrompt = `
          Busque os 15 maiores focos de incêndio ativos em Portugal Continental neste exato momento. 
          Utilize fontes oficiais como a Proteção Civil (prociv.pt) ou fogos.pt.
          Retorne uma lista em JSON com os seguintes campos para cada incêndio: 
          - location (cidade, distrito)
          - status ('Em Resolução', 'Vigilância', 'Conclusão', 'Chegada ao TO', etc.)
          - lat (latitude)
          - lon (longitude)
          - firefighters (número de operacionais)
          - vehicles (número de veículos)
          A latitude e longitude devem ser números.
        `;

        const result = await InvokeLLM({
          prompt: firePrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              fires: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    location: { type: "string" },
                    status: { type: "string" },
                    lat: { type: "number" },
                    lon: { type: "number" },
                    firefighters: { type: "number" },
                    vehicles: { type: "number" },
                  },
                },
              },
            },
          },
        });

        if (result.fires && Array.isArray(result.fires)) {
          // Filter out entries with invalid coordinates
          const validFires = result.fires.filter(fire => 
            fire.lat && fire.lon && fire.lat >= 36 && fire.lat <= 43 && fire.lon >= -10 && fire.lon <= -6
          );
          setFires(validFires);
        }

      } catch (error) {
        console.error("Erro ao obter dados dos incêndios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFireData();
  }, []);

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center text-red-800">
          <Flame className="w-5 h-5 mr-2" />
          Incêndios em Portugal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-[300px] w-full rounded-lg"></div>
        ) : fires.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum foco de incêndio significativo reportado no momento.</p>
        ) : (
          <div className="h-[300px] w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[39.5, -8.0]}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {fires.map((fire, index) => (
                <Marker key={index} position={[fire.lat, fire.lon]} icon={fireIcon}>
                  <Popup>
                    <div className="font-sans">
                      <h4 className="font-bold text-md mb-1">{fire.location}</h4>
                      <p className="text-sm font-semibold text-red-600 mb-2">{fire.status}</p>
                      <div className="flex items-center text-sm mb-1">
                        <Users className="w-4 h-4 mr-1"/> {fire.firefighters} Operacionais
                      </div>
                      <div className="flex items-center text-sm">
                        <Truck className="w-4 h-4 mr-1"/> {fire.vehicles} Veículos
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}