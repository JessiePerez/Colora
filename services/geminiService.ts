
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePalettes = async (hexCode: string): Promise<AnalysisResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza el color hexadecimal ${hexCode}. 
    1. Asígnale un nombre descriptivo en español.
    2. Genera 3 paletas de colores recomendadas (Neutros, Análogos, Contraste). 
    Cada paleta debe tener 3 colores con sus respectivos porcentajes de uso (60%, 30%, 10%).
    3. Genera una lista de 4 colores "arriesgados" (boldColors) que sean contrastantes o inesperados pero que funcionen estéticamente con el color base. DEBEN SER SOLO CÓDIGOS HEXADECIMALES (ej: #FF5500).
    Explica muy brevemente por qué funcionan las paletas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          baseColor: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              name: { type: Type.STRING },
              rgb: { type: Type.STRING }
            },
            required: ["hex", "name", "rgb"]
          },
          palettes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      color: { type: Type.STRING },
                      percentage: { type: Type.NUMBER }
                    },
                    required: ["color", "percentage"]
                  }
                }
              },
              required: ["title", "description", "items"]
            }
          },
          boldColors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 strictly HEX color codes that combine well but are risky"
          }
        },
        required: ["baseColor", "palettes", "boldColors"]
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as AnalysisResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Error generating palettes");
  }
};
