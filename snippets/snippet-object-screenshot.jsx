export const SnippetObjectScreenshot = ({ objectName, filePath = null, extension = 'png' }) => {
  return (
    <>
      <Frame caption={`${objectName[0].toUpperCase() + objectName.slice(1).toLowerCase()} screenshot from the lemlist app interface`}>
        <img src={`/images/objects-definitions/${filePath ?? objectName.toLowerCase()}.${extension}`} alt={`${objectName[0].toUpperCase() + objectName.slice(1).toLowerCase()} screenshot from the lemlist app interface`} />
      </Frame>
    </>
  )
}

