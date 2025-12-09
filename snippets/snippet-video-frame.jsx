export const SnippetVideoFrame = ({
    src,
    autoplay = true,
    loop = true,
    caption,
    alt = null,
}) => {
    return (
        <Frame caption={caption}>
            <video
                src={src}
                autoPlay={autoplay}
                muted
                loop={loop}
                playsInline
                loading="lazy"
                className="w-full aspect-video rounded-xl"
                aria-label={alt ?? caption}
            />
        </Frame>
    );
}
