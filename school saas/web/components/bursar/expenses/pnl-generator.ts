import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export const generatePnLReport = (summary: any, chartData: any[]) => {
    const doc = new jsPDF()

    // 1. Header & Branding
    doc.setFillColor(15, 23, 42) // Slate-900 (Dark)
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("SCHOOL NAME", 105, 15, { align: "center" })

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Profit & Loss Statement", 105, 25, { align: "center" })
    doc.text(`Generated: ${format(new Date(), 'PP')}`, 105, 32, { align: "center" })

    // 2. Executive Summary
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text("Executive Summary", 14, 55)

    const netIsPositive = summary.net >= 0

    const summaryData = [
        ["Total Inflow (Revenue)", `N ${summary.inflow.toLocaleString()}`],
        ["Total Outflow (Expenses + Payroll)", `N ${summary.outflow.toLocaleString()}`],
        ["NET POSITION", `N ${summary.net.toLocaleString()}`]
    ]

    autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Amount']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }, // Slate-700
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.row.index === 2 && data.column.index === 1) {
                data.cell.styles.textColor = netIsPositive ? [22, 163, 74] : [220, 38, 38]
            }
        }
    })

    // 3. Expense Breakdown
    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.text("Expense Breakdown by Category", 14, finalY)

    const expenseData = chartData.map(c => [c.name, `N ${c.value.toLocaleString()}`])

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Category', 'Amount']],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Blue-600
        columnStyles: { 1: { halign: 'right' } }
    })

    // 4. Footer
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const footerY = (doc as any).lastAutoTable.finalY + 20
    doc.text("This report is for internal management use only.", 105, footerY, { align: "center" })

    doc.save(`PnL_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}
