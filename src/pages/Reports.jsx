import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    TextField,
    MenuItem,
    Button,
    Card,
    CardContent,
    Typography,
    Paper,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    TableCell,
    TableBody,
    Grid,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material'
import * as yaml from 'js-yaml'
import Papa from 'papaparse'
import dayjs from 'dayjs'
import NavBar from './NavBar'
import { allDeviceRoute, getLogsRoute } from '../utils/ApiRoutes'

export default function Reports() {
    const [devices, setDevices] = useState([])
    const [selectedDevices, setSelectedDevices] = useState([])
    const [startDate, setStartDate] = useState(
        dayjs().subtract(1, 'day').format('YYYY-MM-DDTHH:mm')
    )
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'))
    const [logs, setLogs] = useState([])
    const [downloadFormat, setDownloadFormat] = useState('json')

    useEffect(() => {
        axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })

        axios
            .get(allDeviceRoute)
            .then((res) => setDevices(res.data))
            .catch((err) => console.error('Error fetching devices:', err))
    }, [])

    const fetchLogs = () => {
        const requestData = {
            startDate,
            endDate,
            deviceIds: selectedDevices.length > 0 ? selectedDevices : null,
        }

        axios
            .post(getLogsRoute, requestData, {
                headers: { 'Content-Type': 'application/json' },
            })
            .then((res) => setLogs(res.data))
            .catch((err) => console.error('Error fetching logs:', err))
    }

    const downloadLogs = () => {
        if (logs.length === 0) return

        let data, fileType, fileExtension

        switch (downloadFormat) {
            case 'csv':
                data = Papa.unparse(logs)
                fileType = 'text/csv'
                fileExtension = 'csv'
                break
            case 'yaml':
                data = yaml.dump(logs)
                fileType = 'text/yaml'
                fileExtension = 'yaml'
                break
            default:
                data = JSON.stringify(logs, null, 2)
                fileType = 'application/json'
                fileExtension = 'json'
        }

        const blob = new Blob([data], { type: fileType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `device_logs_${dayjs().format(
            'YYYYMMDD_HHmmss'
        )}.${fileExtension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <>
            <NavBar />
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: 'text.primary', p: 2 }}
            >
                Device Activity Reports
            </Typography>
            <Card
                sx={{ bgcolor: 'background.paper', boxShadow: 3, p: 3, m: 2 }}
            >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Start Date-Time"
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="End Date-Time"
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                label="Select Devices (Optional)"
                                value={selectedDevices}
                                onChange={(e) => {
                                    console.log(e.target.value)
                                    setSelectedDevices(e.target.value)
                                }}
                                SelectProps={{ multiple: true }}
                                fullWidth
                            >
                                {devices.map((device) => (
                                    <MenuItem
                                        key={device.deviceId}
                                        value={device.deviceId}
                                    >
                                        {device.deviceType} -{' '}
                                        {device.deviceLocation}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* Download Options */}
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            mt: 2,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={fetchLogs}
                            >
                                Get Logs
                            </Button>
                        </Grid>
                        <Grid item>
                            <FormControl
                                sx={{ minWidth: 150 }}
                                size="small"
                                variant="outlined"
                            >
                                <InputLabel id="download-format-label">
                                    Download Format
                                </InputLabel>
                                <Select
                                    labelId="download-format-label"
                                    id="download-format"
                                    value={downloadFormat}
                                    onChange={(e) =>
                                        setDownloadFormat(e.target.value)
                                    }
                                    label="Download Format"
                                >
                                    <MenuItem value="json">JSON</MenuItem>
                                    <MenuItem value="csv">CSV</MenuItem>
                                    <MenuItem value="yaml">YAML</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={downloadLogs}
                                disabled={logs.length === 0}
                            >
                                Download Logs
                            </Button>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <b>Device Location and Type</b>
                                    </TableCell>
                                    <TableCell>
                                        <b>Event</b>
                                    </TableCell>
                                    <TableCell>
                                        <b>Triggered By</b>
                                    </TableCell>
                                    <TableCell>
                                        <b>Timestamp</b>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {entry.device.deviceLocation} -{' '}
                                                {entry.device.deviceType}
                                            </TableCell>
                                            <TableCell>{entry.event}</TableCell>
                                            <TableCell>
                                                {entry.eventBy || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(entry.eventTime).format(
                                                    'YYYY-MM-DD HH:mm:ss'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </>
    )
}
