document.addEventListener('DOMContentLoaded', function () {
    var solarData = JSON.parse(document.getElementById('solarData').innerText);
    updateCheckboxes(solarData);
    displayColoredBlocks(solarData);
});

// function displayColoredBlocks(solarData) {
//     var cmeArray = solarData.cme;
//
//     cmeArray.sort(function (a, b) {
//         return new Date(b.startTime) - new Date(a.startTime);
//     });
//
//     var coloredBlocksContainer = document.getElementById('coloredBlocksContainer');
//     cmeArray.forEach(function (cme) {
//         var coloredBlock = document.createElement('div');
//         coloredBlock.className = 'colored-block';
//         coloredBlock.style.backgroundColor = 'indianred';
//
//         coloredBlock.innerHTML = `
//                     <div><strong>Coronal Mass Ejection (CME)</strong></div>
//                     <div style="align-self: flex-end;">${cme.startTime}</div>
//                     <div style="font-size: 12px;">${cme.note}</div>
//                     <div>Speed: ${cme.averageSpeed}</div>
//                     <div>Angle Width: ${cme.angleWidth}</div>
//                 `;
//
//         coloredBlocksContainer.appendChild(coloredBlock);
//     });
// }

function displayColoredBlocks(solarData) {
    var coloredBlocksContainer = document.getElementById('coloredBlocksContainer');

    var allDataArray = [];
    if (solarData.cme) {
        allDataArray = allDataArray.concat(solarData.cme.map(entry => ({ ...entry, type: 'cme' })));
    }
    if (solarData.gst) {
        allDataArray = allDataArray.concat(solarData.gst.map(entry => ({ ...entry, type: 'gst' })));
    }
    if (solarData.ips) {
        allDataArray = allDataArray.concat(solarData.ips.map(entry => ({ ...entry, type: 'ips' })));
    }
    if (solarData.flr) {
        allDataArray = allDataArray.concat(solarData.flr.map(entry => ({ ...entry, type: 'flr' })));
    }

    allDataArray.sort(function (a, b) {
        const getDate = (entry) => entry.startTime || entry.eventTime || entry.beginTime;
        return new Date(getDate(b)) - new Date(getDate(a));
    });

    allDataArray.forEach(function (data) {
        var coloredBlock = document.createElement('div');
        coloredBlock.className = 'colored-block';

        coloredBlock.style.backgroundColor = getColorBasedOnType(data);

        coloredBlock.innerHTML = getFormattedHTML(data);

        coloredBlocksContainer.appendChild(coloredBlock);
    });
}

function getColorBasedOnType(data) {
    switch (data.type) {
        case 'cme':
            return 'indianred'; // CME color
        case 'gst':
            return 'lightskyblue'; // GST color
        case 'ips':
            return 'darkseagreen'; // IPS color
        case 'flr':
            return 'coral'; // FLR color
        default:
            return 'white'; // Default color
    }
}

function getFormattedHTMLForCME(cme) {
    return `
        <div><strong>Coronal Mass Ejection (CME)</strong></div>
        <div style="align-self: flex-end;">${cme.startTime}</div>
        <div style="font-size: 12px;">${cme.note}</div>
        <div>Speed: ${cme.averageSpeed}</div>
        <div>Angle Width: ${cme.angleWidth}</div>
    `;
}
function getFormattedHTMLForGST(gst){
    return `
        <div><strong>Geomagnetic Storm (GST)</strong></div>
        <div style="align-self: flex-end;">${gst.startTime}</div>
        <div style="font-size: 20px;">Kp-Index: ${gst.kpIndex}</div>
    `;
}
function getFormattedHTMLForIPS(ips) {
    return `
        <div><strong>Interplanetary Shock (IPS)</strong></div>
        <div style="align-self: flex-end;">${ips.eventTime}</div>
    `;
}
function getFormattedHTMLForFLR(flr) {
    return `
        <div><strong>Solar Flare (FLR)</strong></div>
        <div style="align-self: flex-end;">${flr.beginTime}</div>
        <div style="font-size: 20px;">Class and Type: ${flr.classType}</div>
    `;
}
function getFormattedHTML(data) {
    switch (data.type) {
        case 'cme':
            return getFormattedHTMLForCME(data);
        case 'gst':
            return getFormattedHTMLForGST(data);
        case 'ips':
            return getFormattedHTMLForIPS(data);
        case 'flr':
            return getFormattedHTMLForFLR(data);
        default:
            return '';
    }
}

function updateCheckboxes(solarData) {
    document.getElementById('cmeCheckbox').checked = solarData.cme!==null;
    document.getElementById('gstCheckbox').checked = solarData.gst!==null;
    document.getElementById('ipsCheckbox').checked = solarData.ips!==null;
    document.getElementById('flrCheckbox').checked = solarData.flr!==null;
}

function displayLogData() {
    let cme,gst,ips,flr;
    if (document.getElementById('cmeCheckbox').checked) cme='change'; else cme=null;
    if (document.getElementById('gstCheckbox').checked) gst='change'; else gst=null;
    if (document.getElementById('ipsCheckbox').checked) ips='change'; else ips=null;
    if (document.getElementById('flrCheckbox').checked) flr='change'; else flr=null;

    var selectedDate = document.getElementById('dateInput').value;
    var formattedDate = formatDate(selectedDate);
    var sevenDaysBefore = calculateSevenDaysBefore(selectedDate);
    console.log('Selected Date (Y-m-d):', formattedDate);
    console.log('Second Date (7 days before):', sevenDaysBefore);
    fetch('http://localhost:3000/solarchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cme:cme,
            gst:gst,
            ips:ips,
            flr:flr,
            start_date:sevenDaysBefore,
            end_date:formattedDate
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response:', data);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function formatDate(dateString) {
    var date = new Date(dateString);
    var formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
}

function calculateSevenDaysBefore(dateString) {
    var date = new Date(dateString);
    date.setDate(date.getDate() - 7);
    var formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
}