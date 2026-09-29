import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function AdminPageTitle({ title, subtitle, action }) {
	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "flex-end",
				justifyContent: "space-between",
				gap: 2,
				mb: 4,
			}}
		>
			<Box>
				<Typography component="h1" sx={{ fontSize: { xs: 30, md: 36 }, color: "text.primary" }}>
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			{action}
		</Box>
	);
}
