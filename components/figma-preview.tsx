interface FigmaPreviewProps {
  url: string
}

export function FigmaPreview({ url }: FigmaPreviewProps) {
  // Extract the file key from the Figma URL
  const fileKey = url.split("/").pop()

  if (!fileKey) {
    return <div>Invalid Figma URL</div>
  }

  const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-border">
      <iframe className="w-full h-full" src={embedUrl} allowFullScreen />
    </div>
  )
}

