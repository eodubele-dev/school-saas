import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export const generatePayslip = (item: any, run: any) => {
    const doc = new jsPDF()

    // 1. Header & Branding
    doc.setFillColor(37, 99, 235) // Blue-600
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("SCHOOL NAME", 105, 15, { align: "center" }) // Placeholder Name

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Payslip", 105, 25, { align: "center" })
    doc.text(`${run.month} ${run.year}`, 105, 32, { align: "center" })

    // 2. Staff Details
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Name: ${item.staff.first_name} ${item.staff.last_name}`, 14, 50)
    doc.text(`Role: ${item.staff.role}`, 14, 55)
    doc.text(`Staff ID: ${item.staff_id.split('-')[0].toUpperCase()}`, 14, 60) // Short ID

    doc.text(`Bank: ${item.staff.salary_struct?.bank_name || 'N/A'}`, 120, 50)
    doc.text(`Account Not: ${item.staff.salary_struct?.account_number || 'N/A'}`, 120, 55)
    doc.text(`Generated: ${format(new Date(), 'PP')}`, 120, 60)

    // 3. Earnings Table
    const earnings = [
        ["Basic Salary", `N ${item.base_salary.toLocaleString()}`],
        ["Housing Allowance", `N ${(Number(item.staff.salary_struct?.housing_allowance) || 0).toLocaleString()}`],
        ["Transport Allowance", `N ${(Number(item.staff.salary_struct?.transport_allowance) || 0).toLocaleString()}`],
    ]

    // Add attendance bonus/deductions logic if any (currently negative deduction is shown in deductions section)
    // But logically, Gross = Base + Allowances

    autoTable(doc, {
        startY: 70,
        head: [['Earnings', 'Amount']],
        body: earnings,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }, // Emerald header
    })

    // 4. Deductions Table
    const deductions = [
        ["Tax / PAYE", `N ${item.tax_deduction.toLocaleString()}`],
        ["Pension", `N ${item.pension_deduction.toLocaleString()}`],
        ["Absenteeism Deductions", `N ${item.attendance_deductions.toLocaleString()}`], // This includes Late fines
    ]

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Deductions', 'Amount']],
        body: deductions,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // Red header
    })

    // 5. Net Pay Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFillColor(240, 253, 244) // Light green bg
    doc.rect(14, finalY, 182, 20, "F")

    doc.setFontSize(14)
    doc.setTextColor(21, 128, 61) // Green text
    doc.setFont("helvetica", "bold")
    doc.text("NET PAY:", 20, finalY + 13)
    doc.text(`N ${item.net_pay.toLocaleString()}`, 180, finalY + 13, { align: "right" })

    // 6. Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("This is a computer-generated document and requires no signature.", 105, 280, { align: "center" })

    doc.save(`Payslip_${item.staff.first_name}_${run.month}_${run.year}.pdf`)
}
