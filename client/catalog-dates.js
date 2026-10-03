const catalogForm = document.querySelector('#catalog-search');
const startDateInput = document.querySelector('#start-date');
const endDateInput = document.querySelector('#end-date');
const isStayBooking = document.title.includes('ที่พัก');
const originalOpenDetail = window.openDetail;

function dateString(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function nextDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return dateString(new Date(year, month - 1, day + 1));
}

function updateDateRange() {
  const today = dateString(new Date());
  startDateInput.min = today;
  endDateInput.min = nextDate(startDateInput.value || today);
  if (startDateInput.value && (!endDateInput.value || endDateInput.value <= startDateInput.value)) {
    endDateInput.value = endDateInput.min;
  }
  endDateInput.setCustomValidity(
    startDateInput.value && endDateInput.value && endDateInput.value <= startDateInput.value
      ? 'กรุณาเลือกวันสิ้นสุดหลังวันเริ่มต้น'
      : ''
  );
}

function dayCount(start, end) {
  const toUtcDay = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtcDay(end) - toUtcDay(start)) / 86400000);
}

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(year, month - 1, day));
}

updateDateRange();
startDateInput.addEventListener('change', updateDateRange);
endDateInput.addEventListener('change', updateDateRange);

window.openDetail = (item) => {
  updateDateRange();
  if (!catalogForm.reportValidity()) return;

  const duration = dayCount(startDateInput.value, endDateInput.value);
  const dateDescription = isStayBooking
    ? `เข้าพัก ${formatDate(startDateInput.value)} ถึง ${formatDate(endDateInput.value)} (${duration} คืน)`
    : `รับรถ ${formatDate(startDateInput.value)} คืนรถ ${formatDate(endDateInput.value)} (${duration} วัน)`;
  const bookingDates = isStayBooking
    ? { checkIn: startDateInput.value, checkOut: endDateInput.value }
    : { pickupDate: startDateInput.value, returnDate: endDateInput.value };

  originalOpenDetail({
    ...item,
    price: item.price * duration,
    details: [...item.details, dateDescription],
    bookingDates
  });

  const unit = isStayBooking ? 'คืน' : 'วัน';
  document.querySelector('.detail-price small').textContent = `รวม ${duration} ${unit}`;
};
