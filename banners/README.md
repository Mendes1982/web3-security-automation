# 🎨 Banners Personalizados para LinkedIn

Este diretório contém **3 versões de banners** para você usar no LinkedIn, GitHub e outras redes sociais.

## 📁 Arquivos Disponíveis

| Arquivo | Estilo | Melhor Uso |
|---------|--------|------------|
| `banner-linkedin-v1.svg` | **Tech Moderno** com foto destacada | LinkedIn Banner Principal |
| `banner-linkedin-v2.svg` | **Hexagonal Tech** com lista de skills | GitHub README / Apresentações |
| `banner-linkedin-v3.svg` | **Golden Elegance** centralizado | LinkedIn (estilo premium) |

## 📐 Dimensões

- **LinkedIn Banner:** 1500x500px
- **GitHub Social Preview:** 1280x640px
- **Formato:** SVG (vetorial - qualidade máxima em qualquer tamanho)

## 🖼️ Como Substituir sua Foto

### Opção 1: Usar Editor SVG Online (Recomendado)

1. Acesse: https://boxy-svg.com/ ou https://www.svgviewer.dev/
2. Abra o arquivo `.svg` desejado
3. Procure o elemento com texto "SUA FOTO"
4. Substitua por sua imagem (400x400px recomendado)
5. Exporte como PNG ou mantenha SVG

### Opção 2: Usar Canva/Figma

1. Importe o arquivo SVG no Canva ou Figma
2. Substitua o placeholder pela sua foto
3. Ajuste o posicionamento conforme necessário
4. Exporte em alta resolução (PNG)

### Opção 3: Editar Diretamente no Código

1. Abra o arquivo `.svg` em um editor de texto
2. Procure por:
   ```xml
   <text x="1250" y="240" text-anchor="middle" fill="#00d4ff">SUA FOTO</text>
   ```
3. Substitua por:
   ```xml
   <image x="1130" y="130" width="240" height="240" href="sua-foto.png" clip-path="url(#circleView)"/>
   ```

## 🚀 Como Usar no LinkedIn

### 1. **Banner do Perfil**

1. Vá para seu perfil do LinkedIn
2. Clique no ícone de lápis (Editar)
3. Clique no ícone de câmera no banner
4. Faça upload do arquivo PNG
5. Ajuste o posicionamento
6. Salve

### 2. **Imagem de Destaque (Featured)**

1. Na seção "Destaques" do perfil
2. Clique em "Adicionar um destaque"
3. Selecione "Adicionar uma publicação"
4. Faça upload do banner
5. Adicione descrição e link do GitHub

### 3. **Capa de Artigo**

1. Ao criar um artigo no LinkedIn
2. Clique em "Adicionar imagem de capa"
3. Use a versão 3 (Golden Elegance) para artigos

## 🎨 Personalização

### Cores

As cores podem ser facilmente alteradas editando os gradients:

```xml
<!-- No arquivo SVG, procure por: -->
<linearGradient id="textGradient">
  <stop offset="0%" style="stop-color:#00d4ff"/>  <!-- Cor inicial -->
  <stop offset="100%" style="stop-color:#00ff88"/> <!-- Cor final -->
</linearGradient>
```

### Texto

Para alterar o texto, edite os elementos `<text>`:

```xml
<!-- Exemplo: Mudar nome -->
<text x="80" y="440" fill="#ffffff" font-family="Arial" font-size="20">
  Seu Nome Aqui
</text>
```

## 💡 Dicas

1. **Formato SVG:** Mantenha em SVG quando possível - é vetorial e não perde qualidade
2. **PNG:** Se precisar de PNG, exporte em 300 DPI para melhor qualidade
3. **Foto:** Use uma foto profissional com fundo neutro ou transparente
4. **Consistência:** Use o mesmo banner em todas as redes para branding

## 📱 Versões para Outras Plataformas

### Converter para outras dimensões:

```bash
# Usar Inkscape (linha de comando)
inkscape banner-linkedin-v1.svg --export-filename=banner-github.png --export-width=1280 --export-height=640

# Ou usar ImageMagick
convert banner-linkedin-v1.svg -resize 1280x640 banner-github.png
```

### Dimensões por Plataforma:

| Plataforma | Dimensões | Formato |
|------------|-----------|---------|
| LinkedIn Banner | 1500x500 | PNG/JPG |
| LinkedIn Post | 1200x627 | PNG/JPG |
| GitHub Social | 1280x640 | PNG/JPG |
| Twitter Header | 1500x500 | PNG/JPG |
| YouTube Banner | 2560x1440 | PNG/JPG |

## 🎯 Sugestões de Uso

### **Versão 1 (Tech Moderno)**
- Melhor para: LinkedIn Banner de perfil
- Destaque: Foto grande e features em badges
- Tom: Profissional e técnico

### **Versão 2 (Hexagonal Tech)**
- Melhor para: GitHub Social Preview
- Destaque: Lista de tecnologias e layout diferenciado
- Tom: Criativo e inovador

### **Versão 3 (Golden Elegance)**
- Melhor para: Artigos e posts premium
- Destaque: Centralizado, elegante com dourado
- Tom: Premium e sofisticado

## 📞 Suporte

Se precisar de ajuda para personalizar, entre em contato!

---

**Nota:** Lembre-se de substituir o placeholder "SUA FOTO" antes de usar nos perfis! 😉