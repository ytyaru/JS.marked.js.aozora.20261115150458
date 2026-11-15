window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    document.getElementById('source').addEventListener('input', e=>{
        console.log('input !!', e.target.value);
        document.getElementById('content').innerHTML = marked.parse(e.target.value.trim());
    });
    document.getElementById('source').dispatchEvent(new Event('input'));
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});
