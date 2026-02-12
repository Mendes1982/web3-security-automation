#!/bin/bash

# Script para converter banners SVG para PNG
# Requer: Inkscape ou ImageMagick

echo "🎨 Convertendo banners SVG para PNG..."
echo ""

# Verificar se Inkscape está instalado
if command -v inkscape &> /dev/null; then
    echo "✅ Usando Inkscape para conversão de alta qualidade"
    CONVERTER="inkscape"
elif command -v convert &> /dev/null; then
    echo "✅ Usando ImageMagick"
    CONVERTER="imagemagick"
else
    echo "⚠️  Nenhum conversor encontrado!"
    echo ""
    echo "Instale um dos seguintes:"
    echo "  Ubuntu/Debian: sudo apt-get install inkscape"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  Mac: brew install inkscape"
    echo "  Mac: brew install imagemagick"
    exit 1
fi

# Criar diretório de saída
mkdir -p png-exports

# Converter cada banner
for svg in banner-linkedin-v*.svg; do
    if [ -f "$svg" ]; then
        filename=$(basename "$svg" .svg)
        echo "🔄 Convertendo: $svg"
        
        if [ "$CONVERTER" = "inkscape" ]; then
            inkscape "$svg" \
                --export-filename="png-exports/${filename}.png" \
                --export-width=1500 \
                --export-height=500 \
                --export-dpi=300
        else
            convert -background none "$svg" \
                -resize 1500x500 \
                -extent 1500x500 \
                -gravity center \
                "png-exports/${filename}.png"
        fi
        
        if [ $? -eq 0 ]; then
            echo "   ✅ ${filename}.png criado com sucesso!"
        else
            echo "   ❌ Erro ao converter ${filename}"
        fi
    fi
done

echo ""
echo "✨ Conversão concluída!"
echo "📁 Arquivos PNG salvos em: png-exports/"
echo ""
echo "🎯 Dica: Use os arquivos SVG para qualidade máxima no LinkedIn!"
