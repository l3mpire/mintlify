export const SnippetVideoFrame = ({
    src,
    autoplay = true,
    loop = true,
    caption,
    alt = null
}) => {
    return (
        <Frame caption={caption}>
            <video
                autoPlay={autoplay}
                muted
                loop={loop}
                playsInline
                className="w-full aspect-video rounded-xl"
                src={src}
                alt={alt ?? caption}
            />
        </Frame>
    )
}
