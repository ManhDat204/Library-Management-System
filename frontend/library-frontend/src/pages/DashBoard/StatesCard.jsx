import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

const StatesCard = ({ title, value, icon }) => {
  return (
    <Card sx={{ minWidth: 275, margin: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h2" component="div">
          {value}
        </Typography>
        {icon && <div>{icon}</div>}
      </CardContent>
    </Card>
  )
}

export default StatesCard
