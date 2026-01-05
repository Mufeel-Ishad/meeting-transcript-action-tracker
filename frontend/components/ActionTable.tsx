import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from '@mui/material'
import { ActionItem } from '../types'

interface ActionTableProps {
  actions: ActionItem[]
}

export default function ActionTable({ actions }: ActionTableProps) {
  if (actions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No action items found
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actions.map((action, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Chip
                  label={action.owner || 'Unassigned'}
                  color={action.owner === 'Unassigned' ? 'default' : 'primary'}
                  variant={action.owner === 'Unassigned' ? 'outlined' : 'filled'}
                />
              </TableCell>
              <TableCell>{action.task || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

