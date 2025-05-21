import { Spinner, Box } from '@chakra-ui/react'

function Loading() {
  return (
  <Box
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#EEF8F4",
    }}
  >
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      size="xl"
      color="#347357"
    />
    <Box ml={4} fontSize="xl" color="#347357">
      Loading...
    </Box>
  </Box>
  )
}

export default Loading
