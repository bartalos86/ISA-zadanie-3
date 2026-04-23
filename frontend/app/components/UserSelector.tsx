import PersonIcon from "@mui/icons-material/Person";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { type User, fetchUsers } from "../api/client";

interface UserSelectorProps {
  value: User | null;
  onChange: (user: User | null) => void;
}

export default function UserSelector({ value, onChange }: UserSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const res = await fetchUsers(search, 1, 30);
      setOptions(res.users);
      setTotal(res.total);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(inputValue), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, load]);

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 0.75,
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontSize: "0.65rem",
        }}
      >
        Select a User
      </Typography>
      <Autocomplete
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        inputValue={inputValue}
        onInputChange={(_, newInput) => setInputValue(newInput)}
        options={options}
        getOptionLabel={(option) => option.user_id}
        isOptionEqualToValue={(opt, val) => opt.user_id === val.user_id}
        loading={loading}
        noOptionsText={inputValue ? "No users found" : "Start typing to search users"}
        filterOptions={(x) => x}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ gap: 1 }}>
            <PersonIcon sx={{ fontSize: 16, color: "primary.light", opacity: 0.8, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.78rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {option.user_id}
            </Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search by user ID…"
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "0.85rem",
              },
            }}
          />
        )}
      />
      {total > 0 && !loading && (
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
          {total.toLocaleString()} users available
        </Typography>
      )}
    </Box>
  );
}
