export const SnippetObjectReference = ({ objectName, objectPath = null }) => {
  const lowerCaseObjectName = objectName.toLowerCase()
  if (lowerCaseObjectName === 'lead' || lowerCaseObjectName === 'leads') {
    return (
      <Note>
        This endpoint uses the <a href={`/api-reference/objects-definitions/${objectPath}`}>{objectName} object</a>. Make sure to also check the <a href={`/api-reference/objects-definitions/${lowerCaseObjectName === 'lead' ? 'contact' : 'lead'}`}>{lowerCaseObjectName === 'lead' ? 'Contact' : 'Lead'} object</a> to understand the distinction between the two.
      </Note>
    )
  }

  return (
    <Note>
      This endpoint uses the <a href={`/api-reference/objects-definitions/${objectPath}`}>{objectName} object</a>.
    </Note>
  )
}

