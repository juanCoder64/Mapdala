"use client";
import Mapa from "@/components/Mapa";
import { useState } from "react";

export default function Home() {
  const [inicio, setInicio] = useState("");
  const [destino, setDestino] = useState("");
  const [ruta, setRuta] = useState<[number, number][]>([]);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [campoActivo, setCampoActivo] = useState<"inicio" | "destino" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY as string;

  async function obtenerSugerencias(texto: string) {
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }

    try {
      const respuesta = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(texto)}`
      );
      const datos = await respuesta.json();
      const lugares = datos.features.map((feature: { properties: { label: never; }; }) => feature.properties.label);
      setSugerencias(lugares);
    } catch (error) {
      console.error("Error al obtener sugerencias:", error);
    }
  }

  async function obtenerLugar(lugar: string): Promise<[number, number]> {
    const respuesta = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(lugar)}`
    );
    const datos = await respuesta.json();

    if (datos.features && datos.features.length > 0) {
      const coordenadas = datos.features[0].geometry.coordinates;
      return [coordenadas[1], coordenadas[0]];
    } else {
      throw new Error("Lugar no encontrado");
    }
  }

  async function calcularRuta(e: React.FormEvent) {
    e.preventDefault();
    try {
      const inicioCoords = await obtenerLugar(inicio);
      const destinoCoords = await obtenerLugar(destino);

      const respuesta = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${inicioCoords[1]},${inicioCoords[0]}&end=${destinoCoords[1]},${destinoCoords[0]}`
      );
      const datos = await respuesta.json();
      if (!datos.features || datos.features.length === 0) {

      }

      const rutaCoords: [number, number][] = datos.features[0].geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
      );
      setRuta(rutaCoords);
        setError(null);
    } catch (error) {
      setError("Está bien chafa la API y probablemente cree que algun punto está en medio de la nada. SALUDOS");
      console.error("Error al calcular la ruta:", error);
    }
  }

  function manejarSeleccionSugerencia(lugar: string) {
    if (campoActivo === "inicio") {
      setInicio(lugar);
    } else if (campoActivo === "destino") {
      setDestino(lugar);
    }
    setSugerencias([]);
    setCampoActivo(null);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 p-8 sm:grid-cols-2">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mapdala</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ingrese los puntos de inicio y destino para calcular la ruta entre ellos.
          </p>
          {error && (
              <div className="rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-300">
                {error}
              </div>
          )}
          <div className="relative">

            <input
              type="text"
              placeholder="Start Point"
              value={inicio}
              onChange={(e) => {
                setInicio(e.target.value);
                setCampoActivo("inicio");
                obtenerSugerencias(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {campoActivo === "inicio" && sugerencias.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md dark:bg-gray-800 dark:border-gray-700">
                {sugerencias.map((sugerencia, index) => (
                  <li
                    key={index}
                    onClick={() => manejarSeleccionSugerencia(sugerencia)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {sugerencia}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Destination Point"
              value={destino}
              onChange={(e) => {
                setDestino(e.target.value);
                setCampoActivo("destino");
                obtenerSugerencias(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {campoActivo === "destino" && sugerencias.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md dark:bg-gray-800 dark:border-gray-700">
                {sugerencias.map((sugerencia, index) => (
                  <li
                    key={index}
                    onClick={() => manejarSeleccionSugerencia(sugerencia)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {sugerencia}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={calcularRuta}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Calculate Route
          </button>
        </div>

        {/* Map Section */}
        <div className="w-full h-[500px] rounded-lg shadow-md">
          <Mapa routeCoords={ruta} />
        </div>
      </div>
    </main>
  );
}