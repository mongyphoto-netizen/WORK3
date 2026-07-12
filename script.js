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

    const kpiContainer = document.getElementById('kpiContainer');
    
    // Generate KPI HTML
    kpis.forEach((kpi, kpiIndex) => {
        const item = document.createElement('div');
        item.className = 'kpi-item';
        
        let criteriaHtml = '';
        criteria.forEach(crit => {
            let optionsHtml = '';
            for(let i=1; i<=5; i++) {
                const inputName = `kpi_${kpiIndex}_${crit.id}`;
                const inputId = `${inputName}_${i}`;
                optionsHtml += `
                    <label class="rating-option">
                        <input type="radio" name="${inputName}" id="${inputId}" value="${i}" required onchange="calculateScore(${kpiIndex})">
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

        item.innerHTML = `
            <div class="kpi-title">
                ${kpi}
                <span class="kpi-score-badge" id="badge_${kpiIndex}">0 / 15 (รอประเมิน)</span>
            </div>
            ${criteriaHtml}
            <div class="kpi-project-section" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border);">
                <div style="font-weight: 600; color: var(--primary-dark); margin-bottom: 1rem; font-size: 0.95rem;">ข้อเสนอแนะโครงการ / มาตรการ (เฉพาะหัวข้อนี้)</div>
                <div class="form-group">
                    <label>ชื่อโครงการ / มาตรการ</label>
                    <textarea name="project_${kpiIndex}" rows="2" placeholder="ระบุโครงการที่เสนอเพื่อแก้ไขปัญหา..." style="margin-bottom: 0.5rem;"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>หน่วยงานหลัก</label>
                        <input type="text" name="mainAgency_${kpiIndex}" placeholder="เช่น อบต., การประปาฯ">
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>หน่วยงานสนับสนุน</label>
                        <input type="text" name="supportAgency_${kpiIndex}" placeholder="เช่น กรมทรัพยากรน้ำ">
                    </div>
                </div>
            </div>
        `;
        
        kpiContainer.appendChild(item);
    });

    // Make calculateScore globally available
    window.calculateScore = (kpiIndex) => {
        let total = 0;
        let answered = 0;
        
        criteria.forEach(crit => {
            const selected = document.querySelector(`input[name="kpi_${kpiIndex}_${crit.id}"]:checked`);
            if (selected) {
                total += parseInt(selected.value);
                answered++;
            }
        });

        const badge = document.getElementById(`badge_${kpiIndex}`);
        
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

        // Calculate Grand Total
        let grandTotal = 0;
        let totalAnswered = 0;
        
        kpis.forEach((_, idx) => {
            criteria.forEach(crit => {
                const sel = document.querySelector(`input[name="kpi_${idx}_${crit.id}"]:checked`);
                if (sel) {
                    grandTotal += parseInt(sel.value);
                    totalAnswered++;
                }
            });
        });

        const totalScoreEl = document.getElementById('totalScore');
        const urgencyLevelEl = document.getElementById('urgencyLevel');
        
        if (totalScoreEl && urgencyLevelEl) {
            totalScoreEl.innerText = grandTotal;
            if (totalAnswered === kpis.length * 3) {
                // All answered
                let avg = grandTotal / kpis.length;
                let level = '';
                if (avg >= 13) level = 'พื้นที่นี้มีความเร่งด่วนระดับ: เร่งด่วนมาก';
                else if (avg >= 10) level = 'พื้นที่นี้มีความเร่งด่วนระดับ: เร่งด่วน';
                else if (avg >= 7) level = 'พื้นที่นี้มีความเร่งด่วนระดับ: ปานกลาง';
                else if (avg >= 4) level = 'พื้นที่นี้มีความเร่งด่วนระดับ: ต่ำ';
                else level = 'พื้นที่นี้มีความเร่งด่วนระดับ: ต่ำมาก';
                urgencyLevelEl.innerText = level;
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

    // TODO: ใส่ URL ของ Google Apps Script Web App ของคุณที่นี่
    const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Gather Community Info & Grand Total
        const communityName = document.getElementById('communityName').value;
        const totalScoreStr = document.getElementById('totalScore').innerText;
        const urgencyLevelStr = document.getElementById('urgencyLevel').innerText;
        
        // 2. Gather KPI Scores & Projects
        const kpiScores = [];
        const projects = [];
        const agencies = [];
        
        kpis.forEach((_, idx) => {
            // Scores
            const sev = document.querySelector(`input[name="kpi_${idx}_severity"]:checked`)?.value || 0;
            const aff = document.querySelector(`input[name="kpi_${idx}_affected"]:checked`)?.value || 0;
            const read = document.querySelector(`input[name="kpi_${idx}_readiness"]:checked`)?.value || 0;
            kpiScores.push({ severity: sev, affected: aff, readiness: read });
            
            // Projects
            const proj = document.querySelector(`textarea[name="project_${idx}"]`)?.value || '';
            projects.push(proj);
            
            // Agencies
            const mainAg = document.querySelector(`input[name="mainAgency_${idx}"]`)?.value || '';
            const suppAg = document.querySelector(`input[name="supportAgency_${idx}"]`)?.value || '';
            agencies.push({ main: mainAg, support: suppAg });
        });

        // 3. Prepare Payload
        const payload = {
            community: communityName,
            totalScore: totalScoreStr,
            urgency: urgencyLevelStr,
            kpi: kpiScores,
            projects: projects,
            agencies: agencies
        };
        
        // Change button state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>กำลังบันทึกข้อมูล...</span>';
        submitBtn.disabled = true;

        try {
            if (GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
                // ส่งข้อมูลไป Google Sheets
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // สำคัญ: เพื่อไม่ให้ติดปัญหา CORS policy
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                console.warn("ยังไม่ได้ตั้งค่า GOOGLE_SCRIPT_URL");
                // หน่วงเวลาจำลองการโหลด
                await new Promise(r => setTimeout(r, 1000));
            }
            
            // Show success modal
            modal.classList.add('active');
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองอีกครั้ง");
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        
        // Reset all badges
        kpis.forEach((_, i) => {
            const badge = document.getElementById(`badge_${i}`);
            badge.innerHTML = `0 / 15 (รอประเมิน)`;
            badge.style.backgroundColor = 'var(--primary-light)';
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
