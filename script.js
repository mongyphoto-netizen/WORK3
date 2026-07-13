document.addEventListener('DOMContentLoaded', () => {
    const kpis = [
        "1. บำรุงรักษาระบบประปา",
        "2. พัฒนาและปรับปรุงระบบประปาให้เพียงพอและได้มาตรฐาน",
        "3. เพิ่ม/พัฒนาแหล่งน้ำต้นทุน",
        "4. ตรวจสอบคุณภาพน้ำต้นทุน",
        "5. ตรวจสอบคุณภาพน้ำประปาให้ได้มาตรฐาน",
        "6. การบริหารจัดการระบบประปา"
    ];

    const criteria = [
        { id: 'severity', label: 'ความรุนแรงของปัญหา' },
        { id: 'affected', label: 'จำนวนประชาชนที่ได้รับผลกระทบ' },
        { id: 'readiness', label: 'ความพร้อมในการดำเนินโครงการ' }
    ];

    const generateBtn = document.getElementById('generateAreasBtn');
    const dynamicContainer = document.getElementById('dynamicAreasContainer');
    const areasList = document.getElementById('areasList');
    
    // TODO: ใส่ URL ของ Google Apps Script Web App ของคุณที่นี่
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_5wKSJCVIe_HJTRwmBKlPlidPS_x43RzeVzbldSnE8NPdXS2xfCdy-9vfmqJLlsovew/exec";

    let currentAreaCount = 0;

    generateBtn.addEventListener('click', () => {
        const subDistrict = document.getElementById('subDistrict').value.trim();
        const count = parseInt(document.getElementById('areaCount').value);

        if (!subDistrict) {
            alert('กรุณาระบุชื่อตำบลก่อน');
            return;
        }
        if (isNaN(count) || count < 1) {
            alert('กรุณาระบุจำนวนพื้นที่ให้ถูกต้อง (อย่างน้อย 1)');
            return;
        }

        currentAreaCount = count;
        areasList.innerHTML = ''; // Clear previous forms
        
        for (let a = 0; a < count; a++) {
            const areaSection = document.createElement('section');
            areaSection.className = 'card form-section slide-up';
            areaSection.style.animationDelay = `${0.1 * a}s`;
            areaSection.style.marginTop = '2rem';
            areaSection.style.border = '2px solid var(--primary-light)';

            // Area Header & Community Name
            let html = `
                <div class="section-header" style="background: var(--primary-light); color: white; padding: 1rem; border-radius: var(--radius) var(--radius) 0 0; margin: -2rem -2rem 1.5rem -2rem;">
                    <h2 style="color: white; margin: 0; font-size: 1.4rem;">พื้นที่ที่ ${a + 1}</h2>
                </div>
                <div class="form-group">
                    <label>ชื่อพื้นที่ / ชุมชนที่ ${a + 1} <span class="required">*</span></label>
                    <input type="text" id="communityName_${a}" placeholder="ระบุชื่อชุมชน หรือ หมู่ที่..." required>
                </div>
                
                <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: var(--primary-dark); font-size: 1.2rem;">การประเมินปัญหาตาม 6 KPI</h3>
                <div class="kpi-container">
            `;

            // KPIs for this area
            kpis.forEach((kpi, kpiIndex) => {
                let criteriaHtml = '';
                criteria.forEach(crit => {
                    let optionsHtml = '';
                    for(let i=1; i<=5; i++) {
                        const inputName = `area_${a}_kpi_${kpiIndex}_${crit.id}`;
                        const inputId = `${inputName}_${i}`;
                        optionsHtml += `
                            <label class="rating-option">
                                <input type="radio" name="${inputName}" id="${inputId}" value="${i}" required onchange="calculateScore(${a}, ${kpiIndex})">
                                <div class="rating-btn">${i}</div>
                            </label>
                        `;
                    }
                    
                    criteriaHtml += `
                        <div class="rating-group">
                            <div class="rating-label">
                                <span>${crit.label}</span>
                                <span>(1-5)</span>
                            </div>
                            <div class="rating-options">
                                ${optionsHtml}
                            </div>
                        </div>
                    `;
                });

                html += `
                    <div class="kpi-item">
                        <div class="kpi-title">
                            ${kpi}
                            <span class="kpi-score-badge" id="badge_${a}_${kpiIndex}">0 / 15 (รอประเมิน)</span>
                        </div>
                        ${criteriaHtml}
                        <div class="kpi-project-section" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border);">
                            <div style="font-weight: 600; color: var(--primary-dark); margin-bottom: 1rem; font-size: 0.95rem;">ข้อเสนอแนะโครงการ / มาตรการ (เฉพาะหัวข้อนี้)</div>
                            <div class="form-group">
                                <label>ชื่อโครงการ / มาตรการ</label>
                                <textarea name="project_${a}_${kpiIndex}" rows="2" placeholder="ระบุโครงการที่เสนอเพื่อแก้ไขปัญหา..." style="margin-bottom: 0.5rem;"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label>หน่วยงานหลัก</label>
                                    <input type="text" name="mainAgency_${a}_${kpiIndex}" placeholder="เช่น อบต., การประปาฯ">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label>หน่วยงานสนับสนุน</label>
                                    <input type="text" name="supportAgency_${a}_${kpiIndex}" placeholder="เช่น กรมทรัพยากรน้ำ">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div> <!-- kpi-container end -->
                <div class="total-score-card">
                    <h3>คะแนนรวมทุกด้าน (พื้นที่ที่ ${a + 1})</h3>
                    <div class="score-display">
                        <span id="totalScore_${a}">0</span> / 90
                    </div>
                    <div id="urgencyLevel_${a}" class="urgency-level">กรุณาประเมินให้ครบทั้ง 6 รายการ</div>
                </div>
            `;
            
            areaSection.innerHTML = html;
            areasList.appendChild(areaSection);
        }

        dynamicContainer.style.display = 'block';
        
        // Scroll to the first area
        setTimeout(() => {
            dynamicContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    // Make calculateScore globally available
    window.calculateScore = (areaIndex, kpiIndex) => {
        let total = 0;
        let answered = 0;
        
        criteria.forEach(crit => {
            const selected = document.querySelector(`input[name="area_${areaIndex}_kpi_${kpiIndex}_${crit.id}"]:checked`);
            if (selected) {
                total += parseInt(selected.value);
                answered++;
            }
        });

        const badge = document.getElementById(`badge_${areaIndex}_${kpiIndex}`);
        
        if (answered === 3) {
            let level = '';
            let color = '';
            
            if (total >= 13) { level = 'เร่งด่วนมาก'; color = '#ef233c'; }
            else if (total >= 10) { level = 'เร่งด่วน'; color = '#f77f00'; }
            else if (total >= 7) { level = 'ปานกลาง'; color = '#fcbf49'; }
            else if (total >= 4) { level = 'ต่ำ'; color = '#48cae4'; }
            else { level = 'ต่ำมาก'; color = '#a8dadc'; }
            
            badge.innerHTML = `${total} / 15 (${level})`;
            badge.style.backgroundColor = color;
        } else {
            badge.innerHTML = `${total} / 15 (รอประเมิน)`;
            badge.style.backgroundColor = 'var(--primary-light)';
        }

        // Calculate Grand Total for this specific area
        let grandTotal = 0;
        let totalAnswered = 0;
        
        kpis.forEach((_, idx) => {
            criteria.forEach(crit => {
                const sel = document.querySelector(`input[name="area_${areaIndex}_kpi_${idx}_${crit.id}"]:checked`);
                if (sel) {
                    grandTotal += parseInt(sel.value);
                    totalAnswered++;
                }
            });
        });

        const totalScoreEl = document.getElementById(`totalScore_${areaIndex}`);
        const urgencyLevelEl = document.getElementById(`urgencyLevel_${areaIndex}`);
        
        if (totalScoreEl && urgencyLevelEl) {
            totalScoreEl.innerText = grandTotal;
            if (totalAnswered === kpis.length * 3) {
                let avg = grandTotal / kpis.length;
                let level = '';
                if (avg >= 13) level = 'เร่งด่วนมาก';
                else if (avg >= 10) level = 'เร่งด่วน';
                else if (avg >= 7) level = 'ปานกลาง';
                else if (avg >= 4) level = 'ต่ำ';
                else level = 'ต่ำมาก';
                urgencyLevelEl.innerText = `ระดับความเร่งด่วนพื้นที่นี้: ${level}`;
            } else {
                urgencyLevelEl.innerText = `ประเมินแล้ว ${totalAnswered} จาก ${kpis.length * 3} รายการ`;
            }
        }
    };

    // Form submission
    const form = document.getElementById('surveyForm');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subDistrict = document.getElementById('subDistrict').value.trim();
        
        // Collect all areas data
        const areasData = [];
        
        for (let a = 0; a < currentAreaCount; a++) {
            const communityName = document.getElementById(`communityName_${a}`).value.trim();
            const totalScoreStr = document.getElementById(`totalScore_${a}`).innerText;
            const urgencyLevelStr = document.getElementById(`urgencyLevel_${a}`).innerText;
            
            const kpiScores = [];
            const projects = [];
            const agencies = [];
            
            kpis.forEach((_, idx) => {
                const sev = document.querySelector(`input[name="area_${a}_kpi_${idx}_severity"]:checked`)?.value || 0;
                const aff = document.querySelector(`input[name="area_${a}_kpi_${idx}_affected"]:checked`)?.value || 0;
                const read = document.querySelector(`input[name="area_${a}_kpi_${idx}_readiness"]:checked`)?.value || 0;
                kpiScores.push({ severity: sev, affected: aff, readiness: read });
                
                const proj = document.querySelector(`textarea[name="project_${a}_${idx}"]`)?.value || '';
                projects.push(proj);
                
                const mainAg = document.querySelector(`input[name="mainAgency_${a}_${idx}"]`)?.value || '';
                const suppAg = document.querySelector(`input[name="supportAgency_${a}_${idx}"]`)?.value || '';
                agencies.push({ main: mainAg, support: suppAg });
            });
            
            areasData.push({
                communityName: communityName,
                totalScore: totalScoreStr,
                urgency: urgencyLevelStr,
                kpi: kpiScores,
                projects: projects,
                agencies: agencies
            });
        }

        const payload = {
            subDistrict: subDistrict,
            areaCount: currentAreaCount,
            areas: areasData
        };
        
        // Change button state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>กำลังบันทึกข้อมูล...</span>';
        submitBtn.disabled = true;

        try {
            if (GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                console.warn("ยังไม่ได้ตั้งค่า GOOGLE_SCRIPT_URL payload:", payload);
                await new Promise(r => setTimeout(r, 1000)); // Simulate delay
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้ง");
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        dynamicContainer.style.display = 'none';
        areasList.innerHTML = '';
        currentAreaCount = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
