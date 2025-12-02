// app.js - મુખ્ય JavaScript લોજિક (Live Filtering)
let filteredData = [...rawData];
let currentFilterType = "all";
let eventSelections = {
    coming: [],
    notComing: []
};

// Load Gujarati font for PDF
function loadGujaratiFont(callback) {
    const fontUrl = 'https://cdn.jsdelivr.net/npm/noto-sans-gujarati@latest/fonts/NotoSansGujarati-Regular.ttf';
    
    fetch(fontUrl)
        .then(response => response.arrayBuffer())
        .then(fontData => {
            const base64Font = arrayBufferToBase64(fontData);
            callback(base64Font);
        })
        .catch(error => {
            console.error('Error loading Gujarati font:', error);
            callback(null);
        });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Populate filter dropdowns
function populateFilters() {
    updateDropdownFilters();
}

// Update dropdown filters based on current filtered data
function updateDropdownFilters() {
    const citySelect = document.getElementById('filterCity');
    const personSelect = document.getElementById('filterPerson');
    const kankotriCardSelect = document.getElementById('filterKankotriCard');
    
    // Get current selected values
    const currentCity = citySelect.value;
    const currentPerson = personSelect.value;
    const currentKankotriCard = kankotriCardSelect.value;
    
    // Clear existing options (except first)
    citySelect.innerHTML = '<option value="">બધા</option>';
    personSelect.innerHTML = '<option value="">બધા</option>';
    
    // Get unique values from FILTERED data (not rawData)
    const cities = [...new Set(filteredData.map(item => item.city).filter(c => c))];
    const persons = [...new Set(filteredData.map(item => item.person).filter(p => p))];
    const kankotriCards = [...new Set(filteredData.map(item => item.kankotriCard).filter(k => k))];
    
    // Add city options
    cities.sort().forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        if (city === currentCity) option.selected = true;
        citySelect.appendChild(option);
    });
    
    // Add person options
    persons.sort().forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        if (person === currentPerson) option.selected = true;
        personSelect.appendChild(option);
    });
    
    // Add kankotri/card options (keep existing ones)
    const existingKankotriCards = Array.from(kankotriCardSelect.options).map(opt => opt.value);
    
    kankotriCards.forEach(kc => {
        if (!existingKankotriCards.includes(kc)) {
            const option = document.createElement('option');
            option.value = kc;
            option.textContent = kc;
            kankotriCardSelect.appendChild(option);
        }
    });
    
    // Select current value if it exists
    if (currentKankotriCard && kankotriCards.includes(currentKankotriCard)) {
        kankotriCardSelect.value = currentKankotriCard;
    }
}

// Get selected events
function getSelectedEvents() {
    const coming = [];
    const notComing = [];
    
    // Coming events
    if (document.getElementById('comingSagai').checked) coming.push('sagai');
    if (document.getElementById('comingHaldi').checked) coming.push('haldi');
    if (document.getElementById('comingMandap').checked) coming.push('mandap');
    if (document.getElementById('comingDandiya').checked) coming.push('dandiya');
    if (document.getElementById('comingJaan').checked) coming.push('jaan');
    
    // Not coming events
    if (document.getElementById('notComingSagai').checked) notComing.push('sagai');
    if (document.getElementById('notComingHaldi').checked) notComing.push('haldi');
    if (document.getElementById('notComingMandap').checked) notComing.push('mandap');
    if (document.getElementById('notComingDandiya').checked) notComing.push('dandiya');
    if (document.getElementById('notComingJaan').checked) notComing.push('jaan');
    
    return { coming, notComing };
}

// Update selection display
function updateSelectionDisplay() {
    const { coming, notComing } = getSelectedEvents();
    const display = document.getElementById('currentSelection');
    
    let text = "સિલેક્શન: ";
    
    if (coming.length > 0) {
        text += "આવવાના: " + coming.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
    }
    
    if (notComing.length > 0) {
        if (coming.length > 0) text += " | ";
        text += "ન આવવાના: " + notComing.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
    }
    
    if (coming.length === 0 && notComing.length === 0) {
        text = "કોઈ ઇવેન્ટ સિલેક્ટ નથી (બધું બતાવશે)";
    }
    
    display.textContent = text;
}

// Apply event filters (live - called on checkbox change)
function applyEventFilters() {
    const city = document.getElementById('filterCity').value;
    const person = document.getElementById('filterPerson').value;
    const kankotriCard = document.getElementById('filterKankotriCard').value;
    const { coming, notComing } = getSelectedEvents();
    
    // Store current selections
    eventSelections = { coming, notComing };
    
    // Start with all data
    filteredData = [...rawData];
    
    // Apply coming events filter
    if (coming.length > 0) {
        filteredData = filteredData.filter(item => {
            return coming.every(event => item[event] > 0);
        });
    }
    
    // Apply not coming events filter
    if (notComing.length > 0) {
        filteredData = filteredData.filter(item => {
            return notComing.every(event => item[event] === 0);
        });
    }
    
    // Now apply city, person, kankotriCard filters on already event-filtered data
    if (city) {
        filteredData = filteredData.filter(item => item.city === city);
    }
    
    if (person) {
        filteredData = filteredData.filter(item => item.person === person);
    }
    
    if (kankotriCard) {
        filteredData = filteredData.filter(item => item.kankotriCard === kankotriCard);
    }
    
    // Update UI
    currentFilterType = "custom";
    const eventNames = {
        sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", 
        dandiya: "ડાંડિયા", jaan: "જાન"
    };
    
    let statusText = "";
    if (coming.length > 0) {
        statusText += "આવવાના: " + coming.map(e => eventNames[e]).join(", ");
    }
    if (notComing.length > 0) {
        if (statusText) statusText += " | ";
        statusText += "ન આવવાના: " + notComing.map(e => eventNames[e]).join(", ");
    }
    
    document.getElementById('filterStatus').textContent = statusText ? `(${statusText})` : "";
    
    // Update dropdown filters based on current filtered data
    updateDropdownFilters();
    
    renderTable();
    updateSummary();
    updateSelectionDisplay();
}

// Add event listeners to checkboxes for live filtering
function setupEventListeners() {
    // Coming events checkboxes
    document.getElementById('comingSagai').addEventListener('change', applyEventFilters);
    document.getElementById('comingHaldi').addEventListener('change', applyEventFilters);
    document.getElementById('comingMandap').addEventListener('change', applyEventFilters);
    document.getElementById('comingDandiya').addEventListener('change', applyEventFilters);
    document.getElementById('comingJaan').addEventListener('change', applyEventFilters);
    
    // Not coming events checkboxes
    document.getElementById('notComingSagai').addEventListener('change', applyEventFilters);
    document.getElementById('notComingHaldi').addEventListener('change', applyEventFilters);
    document.getElementById('notComingMandap').addEventListener('change', applyEventFilters);
    document.getElementById('notComingDandiya').addEventListener('change', applyEventFilters);
    document.getElementById('notComingJaan').addEventListener('change', applyEventFilters);
    
    // Dropdown filters
    document.getElementById('filterCity').addEventListener('change', applyEventFilters);
    document.getElementById('filterPerson').addEventListener('change', applyEventFilters);
    document.getElementById('filterKankotriCard').addEventListener('change', applyEventFilters);
}

// Clear event filters
function clearEventFilters() {
    // Clear all checkboxes
    document.getElementById('comingSagai').checked = false;
    document.getElementById('comingHaldi').checked = false;
    document.getElementById('comingMandap').checked = false;
    document.getElementById('comingDandiya').checked = false;
    document.getElementById('comingJaan').checked = false;
    
    document.getElementById('notComingSagai').checked = false;
    document.getElementById('notComingHaldi').checked = false;
    document.getElementById('notComingMandap').checked = false;
    document.getElementById('notComingDandiya').checked = false;
    document.getElementById('notComingJaan').checked = false;
    
    // Clear dropdowns
    document.getElementById('filterCity').value = '';
    document.getElementById('filterPerson').value = '';
    document.getElementById('filterKankotriCard').value = '';
    
    // Reset data
    filteredData = [...rawData];
    currentFilterType = "all";
    eventSelections = { coming: [], notComing: [] };
    
    document.getElementById('filterStatus').textContent = "";
    document.getElementById('currentSelection').textContent = "કોઈ ઇવેન્ટ સિલેક્ટ નથી (બધું બતાવશે)";
    
    // Update dropdowns with all options
    updateDropdownFilters();
    
    renderTable();
    updateSummary();
}

// Show all data
function showAllData() {
    clearEventFilters();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="11" class="border p-4 text-center text-gray-500">કોઈ ડેટા મળ્યો નથી</td>`;
        tbody.appendChild(row);
        return;
    }

    // Sort by srNo
    const sortedData = [...filteredData].sort((a, b) => a.srNo - b.srNo);

    sortedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${item.srNo}</td>
            <td class="border p-2">${item.name}</td>
            <td class="border p-2">${item.mobile || "-"}</td>
            <td class="border p-2">${item.city || "-"}</td>
            <td class="border p-2">${item.person}</td>
            <td class="border p-2">${item.kankotriCard}</td>
            <td class="border p-2 ${item.sagai > 0 ? 'bg-green-50' : ''}">${item.sagai}</td>
            <td class="border p-2 ${item.haldi > 0 ? 'bg-yellow-50' : ''}">${item.haldi}</td>
            <td class="border p-2 ${item.mandap > 0 ? 'bg-purple-50' : ''}">${item.mandap}</td>
            <td class="border p-2 ${item.dandiya > 0 ? 'bg-pink-50' : ''}">${item.dandiya}</td>
            <td class="border p-2 ${item.jaan > 0 ? 'bg-indigo-50' : ''}">${item.jaan}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update summary
function updateSummary() {
    const totalPeople = filteredData.length;
    const totalSagai = filteredData.reduce((sum, item) => sum + item.sagai, 0);
    const totalHaldi = filteredData.reduce((sum, item) => sum + item.haldi, 0);
    const totalMandap = filteredData.reduce((sum, item) => sum + item.mandap, 0);
    const totalDandiya = filteredData.reduce((sum, item) => sum + item.dandiya, 0);
    const totalJaan = filteredData.reduce((sum, item) => sum + item.jaan, 0);

    document.getElementById('totalPeople').textContent = totalPeople;
    document.getElementById('totalSagai').textContent = totalSagai;
    document.getElementById('totalHaldi').textContent = totalHaldi;
    document.getElementById('totalMandap').textContent = totalMandap;
    document.getElementById('totalDandiya').textContent = totalDandiya;
    document.getElementById('totalJaan').textContent = totalJaan;
}

// Download PDF with Gujarati font and event list on every page
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Use default font to avoid issues
    doc.setFont("helvetica");
    
    // Add श्री गणेशाय नमः at top
    doc.setFontSize(10);
    doc.text("ॐ श्री गणेशाय नमः", 14, 10);
    
    // Main title
    doc.setFontSize(18);
    doc.text("માનવ લગ્ન મા આમંત્રિત મહેમાનો ની યાદી", 14, 20);
    
    // Event selections on first page
    doc.setFontSize(10);
    let yPos = 30;
    
    // Coming events
    if (eventSelections.coming.length > 0) {
        const comingText = "આવવાના ઇવેન્ટ્સ: " + eventSelections.coming.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
        doc.text(comingText, 14, yPos);
        yPos += 7;
    }
    
    // Not coming events
    if (eventSelections.notComing.length > 0) {
        const notComingText = "ન આવવાના ઇવેન્ટ્સ: " + eventSelections.notComing.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
        doc.text(notComingText, 14, yPos);
        yPos += 7;
    }
    
    // Filter info
    if (eventSelections.coming.length > 0 || eventSelections.notComing.length > 0) {
        doc.text("ફિલ્ટર: કસ્ટમ ઇવેન્ટ ફિલ્ટર", 14, yPos);
        yPos += 7;
    } else {
        doc.text("ફિલ્ટર: બધું ડેટા", 14, yPos);
        yPos += 7;
    }

    // Summary
    doc.setFontSize(12);
    doc.text(`કુલ: ${filteredData.length}`, 14, yPos + 5);
    doc.text(`સગાઈ: ${filteredData.reduce((s, i) => s + i.sagai, 0)}`, 14, yPos + 12);
    doc.text(`હલ્દી: ${filteredData.reduce((s, i) => s + i.haldi, 0)}`, 14, yPos + 19);
    doc.text(`મંડપ: ${filteredData.reduce((s, i) => s + i.mandap, 0)}`, 14, yPos + 26);
    doc.text(`ડાંડિયા: ${filteredData.reduce((s, i) => s + i.dandiya, 0)}`, 14, yPos + 33);
    doc.text(`જાન: ${filteredData.reduce((s, i) => s + i.jaan, 0)}`, 14, yPos + 40);

    // Table headers (in Gujarati)
    const headers = [
        ["Sr No.", "નામ", "મોબાઈલ", "શહેર", "સંબંધ", "કંકોત્રી/કાર્ડ", 
         "સગાઈ", "હલ્દી", "મંડપ", "ડાંડિયા", "જાન"]
    ];

    // Sort data by srNo for PDF
    const sortedData = [...filteredData].sort((a, b) => a.srNo - b.srNo);

    const data = sortedData.map(item => [
        item.srNo.toString(),
        item.name, 
        item.mobile || "-",
        item.city || "-", 
        item.person, 
        item.kankotriCard,
        item.sagai.toString(),
        item.haldi.toString(),
        item.mandap.toString(),
        item.dandiya.toString(),
        item.jaan.toString()
    ]);

    // Custom autoTable to add event list on each page
    const tableOptions = {
        head: headers,
        body: data,
        startY: yPos + 45,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [100, 100, 255] },
        // Add event list to each page
        didDrawPage: function(data) {
            // Add page number
            doc.setFontSize(10);
            doc.text(
                'પેજ: ' + doc.internal.getNumberOfPages(),
                doc.internal.pageSize.width - 20,
                doc.internal.pageSize.height - 10
            );
            
            // Add event list on every page except first
            if (data.pageNumber > 1) {
                doc.setFontSize(9);
                let eventY = 10;
                
                if (eventSelections.coming.length > 0) {
                    const comingText = "આવવાના: " + eventSelections.coming.map(e => {
                        const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
                        return names[e];
                    }).join(", ");
                    doc.text(comingText, 14, eventY);
                    eventY += 5;
                }
                
                if (eventSelections.notComing.length > 0) {
                    const notComingText = "ન આવવાના: " + eventSelections.notComing.map(e => {
                        const names = { sagai: "સગાઈ", haldi: "હલ્દી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
                        return names[e];
                    }).join(", ");
                    doc.text(notComingText, 14, eventY);
                }
            }
        },
        margin: { top: eventSelections.coming.length > 0 || eventSelections.notComing.length > 0 ? 20 : 10 }
    };

    doc.autoTable(tableOptions);

    doc.save(`માનવ_લગ્ન_મહેમાન_યાદી_${Date.now()}.pdf`);
}

// Initialize
window.onload = function() {
    // Populate initial filters
    populateFilters();
    
    // Setup event listeners for live filtering
    setupEventListeners();
    
    // Update UI
    updateSelectionDisplay();
    renderTable();
    updateSummary();
};
