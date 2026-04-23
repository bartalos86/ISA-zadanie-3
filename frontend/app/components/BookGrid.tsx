import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import type { Book } from "../api/client";
import BookCard from "./BookCard";

interface BookGridProps {
  books: Book[];
  showUserRating?: boolean;
}

export default function BookGrid({ books, showUserRating = false }: BookGridProps) {
  return (
    <Grid container spacing={2}>
      {books.map((book) => (
        <Grid
          key={book.asin}
          size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
        >
          <Box sx={{ height: "100%" }}>
            <BookCard book={book} showUserRating={showUserRating} />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
