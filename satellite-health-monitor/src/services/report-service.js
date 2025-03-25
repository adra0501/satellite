// report-service.js with fixed text spacing
// This service handles report generation and export functionality

// Fixed import for jsPDF with autoTable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format as dateFormat } from 'date-fns';

// You might need to install these via npm:
// npm install jspdf jspdf-autotable date-fns

// Utility to format date
const formatDate = (date) => {
  return dateFormat(new Date(date), 'yyyy-MM-dd');
};

// Function to generate a PDF report
// Function to generate a PDF report
const generatePdfReport = (reportType, data, dateRange) => {
  const { satelliteData, anomalies, rootCauses, predictionData } = data;
  const { startDate, endDate } = dateRange;
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title and date with proper spacing
  doc.setFontSize(18);
  doc.text(`Satellite Health: ${reportType}`, 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 30);
  doc.text(`Generated: ${dateFormat(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 36);
  
  // Add current health status section with improved spacing
  doc.setFontSize(14);
  doc.text('Current Health Status', 14, 46);
  
  const currentHealthData = [
    ['Parameter', 'Current Value', 'Threshold', 'Status'],
    ['Power', 
      `${satelliteData.currentValues.power.toFixed(1)}%`, 
      `${satelliteData.thresholds.power.critical}%`,
      satelliteData.currentValues.power < satelliteData.thresholds.power.critical ? 'ALERT' : 'Normal'
    ],
    ['Temperature', 
      `${satelliteData.currentValues.temperature.toFixed(1)}°C`, 
      `${satelliteData.thresholds.temperature.critical}°C`,
      satelliteData.currentValues.temperature > satelliteData.thresholds.temperature.critical ? 'ALERT' : 'Normal'
    ],
    ['Battery Health', 
      `${satelliteData.currentValues.batteryHealth.toFixed(1)}%`, 
      `${satelliteData.thresholds.batteryHealth.critical}%`,
      satelliteData.currentValues.batteryHealth < satelliteData.thresholds.batteryHealth.critical ? 'ALERT' : 'Normal'
    ],
    ['Signal Strength', 
      `${satelliteData.currentValues.signalStrength.toFixed(1)}%`, 
      `${satelliteData.thresholds.signalStrength.critical}%`,
      satelliteData.currentValues.signalStrength < satelliteData.thresholds.signalStrength.critical ? 'ALERT' : 'Normal'
    ],
    ['Memory Usage', 
      `${satelliteData.currentValues.memoryUsage.toFixed(1)}%`, 
      `${satelliteData.thresholds.memoryUsage.critical}%`,
      satelliteData.currentValues.memoryUsage > satelliteData.thresholds.memoryUsage.critical ? 'ALERT' : 'Normal'
    ]
  ];
  
  // Use autoTable with improved configuration for better spacing
  autoTable(doc, {
    startY: 50,
    head: [currentHealthData[0]],
    body: currentHealthData.slice(1),
    theme: 'striped',
    headStyles: { 
      fillColor: [66, 139, 202],
      cellPadding: 4,
      fontSize: 10
    },
    styles: { 
      cellPadding: 4,
      fontSize: 9,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Parameter column
      1: { cellWidth: 30 }, // Current Value column
      2: { cellWidth: 30 }, // Threshold column
      3: { cellWidth: 30 }  // Status column
    }
  });
  
  // Based on report type, add specific sections with improved spacing
  switch(reportType) {
    case 'Health Summary Report':
      // Add anomalies section with more space
      const startY = doc.lastAutoTable.finalY + 20; // Increased space after health status table
      doc.setFontSize(14);
      doc.text('Recent Anomalies', 14, startY);
      
      let anomalyTableEndY = startY + 10; // Default if no table is drawn
      
      if (anomalies && anomalies.length > 0) {
        const anomalyData = [
          ['Parameter', 'Value', 'Threshold', 'Timestamp', 'Severity']
        ];
        
        anomalies.slice(-5).forEach(anomaly => {
          anomalyData.push([
            anomaly.parameter ? (anomaly.parameter.charAt(0).toUpperCase() + anomaly.parameter.slice(1).replace(/([A-Z])/g, ' $1').trim()) : 'Unknown',
            typeof anomaly.value === 'number' ? anomaly.value.toFixed(1) : (anomaly.value || 'N/A'),
            anomaly.threshold || 'N/A',
            anomaly.timestamp || new Date().toLocaleString(),
            (anomaly.severity || 'low').toUpperCase()
          ]);
        });
        
        autoTable(doc, {
          startY: startY + 4,
          head: [anomalyData[0]],
          body: anomalyData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [66, 139, 202],
            cellPadding: 4,
            fontSize: 10
          },
          styles: { 
            cellPadding: 4,
            fontSize: 9,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 30 }, // Parameter column
            1: { cellWidth: 25 }, // Value column
            2: { cellWidth: 25 }, // Threshold column
            3: { cellWidth: 50 }, // Timestamp column
            4: { cellWidth: 25 }  // Severity column
          },
          didDrawPage: (data) => {
            // Store the final Y position after drawing the table
            anomalyTableEndY = data.cursor.y;
          }
        });
      } else {
        doc.setFontSize(11);
        doc.text('No anomalies detected in the reporting period.', 14, startY + 10);
        anomalyTableEndY = startY + 20; // Set position after "no anomalies" text
      }
      
      // Add lifetime predictions with improved spacing
      // Use the anomaly table end position plus 40 for more space
      const predStartY = anomalyTableEndY + 40;
      doc.setFontSize(14);
      doc.text('Component Lifetime Predictions', 14, predStartY);
      
      const predictionTable = [
        ['Component', 'Estimated Days Remaining'],
        ['Battery', predictionData.batteryLifetime],
        ['Power System', predictionData.powerSystemLifetime],
        ['Communication System', predictionData.communicationSystemLifetime],
        ['Thermal System', predictionData.thermalSystemLifetime],
        ['Memory System', predictionData.memorySystemLifetime]
      ];
      
      autoTable(doc, {
        startY: predStartY + 4,
        head: [predictionTable[0]],
        body: predictionTable.slice(1),
        theme: 'striped',
        headStyles: { 
          fillColor: [66, 139, 202],
          cellPadding: 4,
          fontSize: 10
        },
        styles: { 
          cellPadding: 4,
          fontSize: 9,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 80 }, // Component column
          1: { cellWidth: 70 }  // Estimated Days column
        }
      });
      break;
      
    case 'Anomaly Detail Report':
      // Add root cause analysis section with improved spacing
      const rcStartY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Root Cause Analysis', 14, rcStartY);
      
      if (rootCauses && rootCauses.length > 0) {
        const rootCauseData = [
          ['Anomaly', 'Probable Cause', 'Probability', 'Recommendation']
        ];
        
        rootCauses.forEach(cause => {
          rootCauseData.push([
            cause.anomalyParameter ? (cause.anomalyParameter.charAt(0).toUpperCase() + cause.anomalyParameter.slice(1).replace(/([A-Z])/g, ' $1').trim()) : 'Unknown',
            cause.cause || 'Unknown cause',
            `${cause.probability || 0}%`,
            cause.recommendation || 'No recommendation available'
          ]);
        });
        
        autoTable(doc, {
          startY: rcStartY + 4,
          head: [rootCauseData[0]],
          body: rootCauseData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [66, 139, 202],
            cellPadding: 4,
            fontSize: 10
          },
          styles: { 
            cellPadding: 4,
            fontSize: 9,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 30 },  // Anomaly column
            1: { cellWidth: 60 },  // Probable Cause column
            2: { cellWidth: 25 },  // Probability column
            3: { cellWidth: 70 }   // Recommendation column
          }
        });
      } else {
        doc.setFontSize(11);
        doc.text('No root causes to analyze in the reporting period.', 14, rcStartY + 10);
      }
      break;
      
    case 'Power Efficiency Report':
      // Add power usage breakdown with improved spacing
      const powerStartY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Power Usage Breakdown', 14, powerStartY);
      
      const powerData = [
        ['System', 'Usage Percentage'],
        ['Communication Systems', '35%'],
        ['Navigation & Control', '25%'],
        ['Scientific Instruments', '20%'],
        ['Thermal Control', '15%'],
        ['Other Systems', '5%']
      ];
      
      autoTable(doc, {
        startY: powerStartY + 4,
        head: [powerData[0]],
        body: powerData.slice(1),
        theme: 'striped',
        headStyles: { 
          fillColor: [66, 139, 202],
          cellPadding: 4,
          fontSize: 10
        },
        styles: { 
          cellPadding: 4,
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 100 }, // System column
          1: { cellWidth: 50 }   // Usage Percentage column
        }
      });
      
      // Add optimization recommendations with improved spacing
      const optStartY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Power Optimization Recommendations', 14, optStartY);
      
      const optData = [
        ['Recommendation', 'Potential Savings'],
        ['Reduce communication system duty cycle during low-activity periods', '5%'],
        ['Implement sleep mode for scientific instruments when not in use', '4%'],
        ['Optimize thermal control system cycling', '3%']
      ];
      
      autoTable(doc, {
        startY: optStartY + 4,
        head: [optData[0]],
        body: optData.slice(1),
        theme: 'striped',
        headStyles: { 
          fillColor: [66, 139, 202],
          cellPadding: 4,
          fontSize: 10
        },
        styles: { 
          cellPadding: 4,
          fontSize: 9,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 130 }, // Recommendation column
          1: { cellWidth: 30 }   // Potential Savings column
        }
      });
      break;
      
    case 'Maintenance Prediction Report':
      // Add detailed component lifetime analysis with improved spacing
      const maintStartY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Maintenance Schedule Projection', 14, maintStartY);
      
      const maintData = [
        ['Component', 'Days Remaining', 'Recommended Action', 'Priority'],
        ['Battery', 
          predictionData.batteryLifetime, 
          predictionData.batteryLifetime < 30 ? 'Immediate replacement' : 'Monitor',
          predictionData.batteryLifetime < 30 ? 'HIGH' : 'Medium'
        ],
        ['Power System', 
          predictionData.powerSystemLifetime, 
          predictionData.powerSystemLifetime < 30 ? 'System calibration' : 'Monitor',
          predictionData.powerSystemLifetime < 30 ? 'HIGH' : 'Medium'
        ],
        ['Communication System', 
          predictionData.communicationSystemLifetime, 
          predictionData.communicationSystemLifetime < 30 ? 'Signal analysis' : 'Monitor',
          predictionData.communicationSystemLifetime < 30 ? 'HIGH' : 'Medium'
        ],
        ['Thermal System', 
          predictionData.thermalSystemLifetime, 
          predictionData.thermalSystemLifetime < 30 ? 'Coolant refill' : 'Monitor',
          predictionData.thermalSystemLifetime < 30 ? 'HIGH' : 'Medium'
        ],
        ['Memory System', 
          predictionData.memorySystemLifetime, 
          predictionData.memorySystemLifetime < 30 ? 'Data cleanup' : 'Monitor',
          predictionData.memorySystemLifetime < 30 ? 'HIGH' : 'Medium'
        ]
      ];
      
      autoTable(doc, {
        startY: maintStartY + 4,
        head: [maintData[0]],
        body: maintData.slice(1),
        theme: 'striped',
        headStyles: { 
          fillColor: [66, 139, 202],
          cellPadding: 4,
          fontSize: 10
        },
        styles: { 
          cellPadding: 4,
          fontSize: 9,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 40 },  // Component column
          1: { cellWidth: 30 },  // Days Remaining column
          2: { cellWidth: 80 },  // Recommended Action column
          3: { cellWidth: 30 }   // Priority column
        }
      });
      break;
    
    default:
      // No additional sections for unknown report types
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Satellite Health Monitoring System - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  }
  
  // Return the document
  return doc;
};
// Function to generate a CSV export
const generateCsvExport = (reportType, data, dateRange) => {
  const { satelliteData, anomalies, rootCauses, predictionData } = data;
  const { startDate, endDate } = dateRange;
  
  // Header for CSV
  let csvContent = `Satellite Health: ${reportType}\n`;
  csvContent += `Report Period: ${startDate} to ${endDate}\n`;
  csvContent += `Generated: ${dateFormat(new Date(), 'yyyy-MM-dd HH:mm')}\n\n`;
  
  // Current health status
  csvContent += "Current Health Status\n";
  csvContent += "Parameter,Current Value,Threshold,Status\n";
  
  csvContent += `Power,${satelliteData.currentValues.power.toFixed(1)}%,${satelliteData.thresholds.power.critical}%,`;
  csvContent += `${satelliteData.currentValues.power < satelliteData.thresholds.power.critical ? 'ALERT' : 'Normal'}\n`;
  
  csvContent += `Temperature,${satelliteData.currentValues.temperature.toFixed(1)}°C,${satelliteData.thresholds.temperature.critical}°C,`;
  csvContent += `${satelliteData.currentValues.temperature > satelliteData.thresholds.temperature.critical ? 'ALERT' : 'Normal'}\n`;
  
  csvContent += `Battery Health,${satelliteData.currentValues.batteryHealth.toFixed(1)}%,${satelliteData.thresholds.batteryHealth.critical}%,`;
  csvContent += `${satelliteData.currentValues.batteryHealth < satelliteData.thresholds.batteryHealth.critical ? 'ALERT' : 'Normal'}\n`;
  
  csvContent += `Signal Strength,${satelliteData.currentValues.signalStrength.toFixed(1)}%,${satelliteData.thresholds.signalStrength.critical}%,`;
  csvContent += `${satelliteData.currentValues.signalStrength < satelliteData.thresholds.signalStrength.critical ? 'ALERT' : 'Normal'}\n`;
  
  csvContent += `Memory Usage,${satelliteData.currentValues.memoryUsage.toFixed(1)}%,${satelliteData.thresholds.memoryUsage.critical}%,`;
  csvContent += `${satelliteData.currentValues.memoryUsage > satelliteData.thresholds.memoryUsage.critical ? 'ALERT' : 'Normal'}\n\n`;
  
  // Add specific sections based on report type
  switch(reportType) {
    case 'Health Summary Report':
      // Add anomalies section
      csvContent += "Recent Anomalies\n";
      
      if (anomalies && anomalies.length > 0) {
        csvContent += "Parameter,Value,Threshold,Timestamp,Severity\n";
        
        anomalies.slice(-5).forEach(anomaly => {
          csvContent += `${anomaly.parameter ? (anomaly.parameter.charAt(0).toUpperCase() + anomaly.parameter.slice(1).replace(/([A-Z])/g, ' $1').trim()) : 'Unknown'},`;
          csvContent += `${typeof anomaly.value === 'number' ? anomaly.value.toFixed(1) : (anomaly.value || 'N/A')},`;
          csvContent += `${anomaly.threshold || 'N/A'},`;
          csvContent += `${anomaly.timestamp || new Date().toLocaleString()},`;
          csvContent += `${(anomaly.severity || 'low').toUpperCase()}\n`;
        });
      } else {
        csvContent += "No anomalies detected in the reporting period.\n";
      }
      
      // Add lifetime predictions
      csvContent += "\nComponent Lifetime Predictions\n";
      csvContent += "Component,Estimated Days Remaining\n";
      csvContent += `Battery,${predictionData.batteryLifetime}\n`;
      csvContent += `Power System,${predictionData.powerSystemLifetime}\n`;
      csvContent += `Communication System,${predictionData.communicationSystemLifetime}\n`;
      csvContent += `Thermal System,${predictionData.thermalSystemLifetime}\n`;
      csvContent += `Memory System,${predictionData.memorySystemLifetime}\n`;
      break;
      
    // Other report types remain the same as before...
    case 'Anomaly Detail Report':
      // Add root cause analysis section
      csvContent += "Root Cause Analysis\n";
      
      if (rootCauses && rootCauses.length > 0) {
        csvContent += "Anomaly,Probable Cause,Probability,Recommendation\n";
        
        rootCauses.forEach(cause => {
          csvContent += `${cause.anomalyParameter ? (cause.anomalyParameter.charAt(0).toUpperCase() + cause.anomalyParameter.slice(1).replace(/([A-Z])/g, ' $1').trim()) : 'Unknown'},`;
          // Escape commas in text fields
          csvContent += `"${cause.cause || 'Unknown cause'}",`;
          csvContent += `${cause.probability || 0}%,`;
          csvContent += `"${cause.recommendation || 'No recommendation available'}"\n`;
        });
      } else {
        csvContent += "No root causes to analyze in the reporting period.\n";
      }
      break;
      
    case 'Power Efficiency Report':
      // Add power usage breakdown
      csvContent += "Power Usage Breakdown\n";
      csvContent += "System,Usage Percentage\n";
      csvContent += "Communication Systems,35%\n";
      csvContent += "Navigation & Control,25%\n";
      csvContent += "Scientific Instruments,20%\n";
      csvContent += "Thermal Control,15%\n";
      csvContent += "Other Systems,5%\n\n";
      
      // Add optimization recommendations
      csvContent += "Power Optimization Recommendations\n";
      csvContent += "Recommendation,Potential Savings\n";
      csvContent += "\"Reduce communication system duty cycle during low-activity periods\",5%\n";
      csvContent += "\"Implement sleep mode for scientific instruments when not in use\",4%\n";
      csvContent += "\"Optimize thermal control system cycling\",3%\n";
      break;
      
    case 'Maintenance Prediction Report':
      // Add detailed component lifetime analysis
      csvContent += "Maintenance Schedule Projection\n";
      csvContent += "Component,Days Remaining,Recommended Action,Priority\n";
      
      csvContent += `Battery,${predictionData.batteryLifetime},`;
      csvContent += `"${predictionData.batteryLifetime < 30 ? 'Immediate replacement' : 'Monitor'}",`;
      csvContent += `${predictionData.batteryLifetime < 30 ? 'HIGH' : 'Medium'}\n`;
      
      csvContent += `Power System,${predictionData.powerSystemLifetime},`;
      csvContent += `"${predictionData.powerSystemLifetime < 30 ? 'System calibration' : 'Monitor'}",`;
      csvContent += `${predictionData.powerSystemLifetime < 30 ? 'HIGH' : 'Medium'}\n`;
      
      csvContent += `Communication System,${predictionData.communicationSystemLifetime},`;
      csvContent += `"${predictionData.communicationSystemLifetime < 30 ? 'Signal analysis' : 'Monitor'}",`;
      csvContent += `${predictionData.communicationSystemLifetime < 30 ? 'HIGH' : 'Medium'}\n`;
      
      csvContent += `Thermal System,${predictionData.thermalSystemLifetime},`;
      csvContent += `"${predictionData.thermalSystemLifetime < 30 ? 'Coolant refill' : 'Monitor'}",`;
      csvContent += `${predictionData.thermalSystemLifetime < 30 ? 'HIGH' : 'Medium'}\n`;
      
      csvContent += `Memory System,${predictionData.memorySystemLifetime},`;
      csvContent += `"${predictionData.memorySystemLifetime < 30 ? 'Data cleanup' : 'Monitor'}",`;
      csvContent += `${predictionData.memorySystemLifetime < 30 ? 'HIGH' : 'Medium'}\n`;
      break;
    
    default:
      // No additional sections for unknown report types
  }
  
  return csvContent;
};

// Function to download a PDF
const downloadPdf = (doc, filename) => {
  doc.save(filename);
};

// Function to download a CSV
const downloadCsv = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append to document, click to download, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to view a PDF in a new tab
const viewPdf = (doc) => {
  const pdfDataUri = doc.output('datauristring');
  window.open(pdfDataUri, '_blank');
};

// Main function to generate and handle reports
const generateReport = (reportType, data, dateRange, format = 'pdf', action = 'download') => {
  // Generate filename
  const timestamp = dateFormat(new Date(), 'yyyyMMdd_HHmmss');
  const cleanReportType = reportType.replace(/\s+/g, '_').toLowerCase();
  const filename = `satellite_${cleanReportType}_${timestamp}.${format}`;
  
  if (format === 'pdf') {
    const pdfDoc = generatePdfReport(reportType, data, dateRange);
    
    if (action === 'download') {
      downloadPdf(pdfDoc, filename);
      return { success: true, filename };
    } else if (action === 'view') {
      viewPdf(pdfDoc);
      return { success: true };
    }
  } else if (format === 'csv') {
    const csvContent = generateCsvExport(reportType, data, dateRange);
    downloadCsv(csvContent, filename);
    return { success: true, filename };
  }
  
  return { success: false, error: 'Unsupported format or action' };
};

export default {
  generateReport
};