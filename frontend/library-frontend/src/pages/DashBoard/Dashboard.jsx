import React from "react"
import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import StatesCard from './StatesCard'

const Dashboard = () => {
  // Sample data - in a real app, this would come from an API
  const stats = [
    { title: 'Total Books', value: 120 },
    { title: 'Borrowed Books', value: 45 },
    { title: 'Available Books', value: 75 },
    { title: 'Total Users', value: 200 },
    { title: 'Active Loans', value: 30 },
    { title: 'Overdue Books', value: 5 }
  ]

  const recentLoans = [
    { id: 1, book: 'The Great Gatsby', user: 'John Doe', dueDate: '2026-03-01' },
    { id: 2, book: '1984', user: 'Jane Smith', dueDate: '2026-03-05' },
    { id: 3, book: 'To Kill a Mockingbird', user: 'Bob Johnson', dueDate: '2026-03-10' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 via-white to bg-purple-500 p-4">
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
          Library Management Dashboard
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StatesCard title={stat.title} value={stat.value} />
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white', mt: 6, mb: 2 }}>
          Recent Loans
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.book}</TableCell>
                  <TableCell>{loan.user}</TableCell>
                  <TableCell>{loan.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  )
}

export default Dashboard
