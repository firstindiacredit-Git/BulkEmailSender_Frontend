import React, { useState } from 'react'
import * as XLSX from 'xlsx'

const EmailMessageSender = () => {
  const [emails, setEmails] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileUploadError, setFileUploadError] = useState(null)

  // Excel से ईमेल एक्सट्रैक्ट करने का फंक्शन
  const extractEmailsFromExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          let extractedEmails = []
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

          jsonData.forEach(row => {
            if (Array.isArray(row)) {
              row.forEach(cell => {
                const cellStr = String(cell)
                if (emailRegex.test(cellStr)) {
                  extractedEmails.push(cellStr.trim())
                }
              })
            }
          })

          resolve(extractedEmails)
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  // फ़ाइल अपलोड हैंडलर
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    setFileUploadError(null)

    if (!file) return

    const fileType = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
      setFileUploadError("कृपया केवल Excel या CSV फ़ाइल अपलोड करें")
      return
    }

    try {
      setIsLoading(true)
      const extractedEmails = await extractEmailsFromExcel(file)

      if (extractedEmails.length === 0) {
        setFileUploadError("फ़ाइल में कोई वैध ईमेल एड्रेस नहीं मिला")
        return
      }

      setEmails(extractedEmails.join(', '))
      setStatus('Emails loaded successfully from Excel!')
    } catch (err) {
      setFileUploadError("फ़ाइल को पढ़ने में त्रुटि। कृपया सही फॉर्मैट वाली फ़ाइल अपलोड करें।")
    } finally {
      setIsLoading(false)
    }
  }

  // ड्रैग एंड ड्रॉप हैंडलर्स
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const fileType = file.name.split('.').pop().toLowerCase()
      
      if (!['xlsx', 'xls', 'csv'].includes(fileType)) {
        setFileUploadError("कृपया केवल Excel या CSV फ़ाइल अपलोड करें")
        return
      }

      try {
        setIsLoading(true)
        const extractedEmails = await extractEmailsFromExcel(file)

        if (extractedEmails.length === 0) {
          setFileUploadError("फ़ाइल में कोई वैध ईमेल एड्रेस नहीं मिला")
          return
        }

        setEmails(extractedEmails.join(', '))
        setStatus('Emails loaded successfully from Excel!')
      } catch (err) {
        setFileUploadError("फ़ाइल को पढ़ने में त्रुटि। कृपया सही फॉर्मैट वाली फ़ाइल अपलोड करें।")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('Sending...')
    
    try {
      const response = await fetch('https://bulk-email-sender-backend.vercel.app/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emails.split(',').map(email => email.trim()),
          subject,
          message
        })
      })

      const data = await response.json()
      if (data.success) {
        setStatus('Emails sent successfully!')
        setEmails('')
        setSubject('')
        setMessage('')
      } else {
        setStatus('Failed to send emails: ' + data.error)
      }
    } catch (error) {
      setStatus('Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-2 sm:p-4 bg-gray-50">
      {/* Header Section */}
      <div className="w-full max-w-5xl mb-2 sm:mb-4 text-center px-2">
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
            Email Bulk Message Sender
          </h1>
        </div>
        <p className="text-gray-600 max-w-4xl mx-auto text-xs sm:text-sm mb-2 sm:mb-4">
          Send bulk emails efficiently. Enter email addresses separated by commas.
        </p>
      </div>

      <div className="w-full max-w-5xl relative">
        <div className="relative">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column - Input Form */}
            <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4">
              {/* Excel Upload Section */}
              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Upload Excel File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">.xlsx, .xls, or .csv</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {fileUploadError && (
                  <p className="mt-2 text-xs text-red-600">{fileUploadError}</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email Addresses
                </label>
          <textarea 
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm"
                  placeholder="Enter email addresses separated by commas"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            required
                  rows={4}
                />
                <div className="flex justify-between mt-1 sm:mt-2">
                  <p className="text-xs text-gray-500">Example: email1@example.com, email2@example.com</p>
                  <p className="text-xs text-gray-500">
                    {emails ? emails.split(',').filter(n => n.trim()).length : 0} emails
                  </p>
                </div>
        </div>

              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm"
                  placeholder="Enter email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

              <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Message Content</label>
          <textarea 
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-sm"
                  placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
                  rows={4}
                />
              </div>

              <button
                className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-[1.01] shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center text-sm"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Send Emails
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Status */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all mt-3 lg:mt-0">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Status
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center h-56 sm:h-64 md:h-72 lg:h-80 bg-white rounded-lg border border-gray-200">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-indigo-500 mb-2 sm:mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-indigo-600 font-medium text-xs sm:text-sm">Sending emails...</p>
                    <p className="text-gray-500 text-xs mt-1">Please wait</p>
                  </div>
                ) : status ? (
                  <div className={`text-center p-4 rounded-lg ${status.includes('Error') || status.includes('Failed') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                    <svg className={`w-12 h-12 mx-auto mb-2 ${status.includes('Error') || status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {status.includes('Error') || status.includes('Failed') ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <p className="font-medium text-sm">{status}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-700 font-medium text-sm">Ready to send emails</p>
                    <p className="text-xs text-gray-500 mt-1">Enter email addresses and message to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center w-full max-w-5xl mt-3 sm:mt-4 py-2 px-2 sm:px-4">
        <div className="text-xs text-gray-600 font-bold mb-1">DISCLAIMER: Use this service responsibly and in accordance with email regulations.</div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Email Bulk Message Sender | All Rights Reserved
        </p>
      </div>
    </div>
  )
}

export default EmailMessageSender
