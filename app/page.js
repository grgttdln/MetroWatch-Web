import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={styles.container}>
      <Typography>Hello World</Typography>
    </Box>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};
