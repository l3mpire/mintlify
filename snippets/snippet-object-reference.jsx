export const SnippetObjectReference = ({ objectName, objectPath = null }) => {
  return (
    <Note>
      This endpoint uses the <a href={`/api-reference/objects-definitions/${objectPath}`}>{objectName} object</a>.
    </Note>
  )
}

