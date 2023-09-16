function getCookie(name) {
    function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
    var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
}
alert = getCookie('alert');
if(alert != undefined) {
    if(alert == "wrongpassword") {
        Swal.fire({
            icon: 'error',
            title: 'รหัสผ่านผิด...',
            text: 'ข้อมูลไม่ตรงกับผู้ใช้ใดๆ',
        })
    }
    if(alert == "success") {
        Swal.fire({
            icon: 'success',
            title: 'เสร็จสมบูรณ์...',
            text: 'การทำงานเสร็จสมบูรณ์',
        })
    }
    if(alert == "loggedin") {
        Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบเรียบร้อย...',
            text: 'เข้าสู้ระบบเสร็จสมบูรณ์',
        })
    }
    if(alert == "loggedout") {
        Swal.fire({
            icon: 'success',
            title: 'ออกจากระบบเรียบร้อย...',
            text: 'ออกจากระบบเสร็จสมบูรณ์',
        })
    }
    if(alert == "successfuly_changes_password") {
        Swal.fire({
            icon: 'success',
            title: 'เปลี่ยนรหัสผ่านเรียบร้อย...',
            text: 'เปลี่ยนรหัสผ่านเสร็จสมบูรณ์',
        })
    }
    if(alert == "successfully_registered") {
        Swal.fire({
            icon: 'success',
            title: 'สมัครสมาชิกเรียบร้อย...',
            text: 'สมัครสมาชิกเสร็จสมบูรณ์',
        })
    }
    document.cookie = "alert=; max-age=0;";
}