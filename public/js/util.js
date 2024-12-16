const util = {
    /* toast메세지 */
    showToastMsg(msg = "", type = 'W') {
        const toast = document.getElementById('toast');
        let backgroundColor = "";
        
        switch (type) {
            case 'W': /* warning */
                backgroundColor = '#FF4C4C';
                break;
            case 'S': /* success */
                backgroundColor = '#333';
                break;
        }
        
        toast.innerHTML = msg;
        toast.style.display = 'block';
        toast.style.background = backgroundColor;
        toast.style.top = '-100px'; // Ensure it's offscreen initially
        
        // Animate toast into view
        setTimeout(() => {
            toast.style.transition = 'top 0.3s ease-in-out';
            toast.style.top = '20px';
        }, 10); // Small delay to allow the transition to take effect
        
        // Wait for 4 seconds and then hide toast
        setTimeout(() => {
            toast.style.top = '-100px';
            toast.addEventListener('transitionend', () => {
                toast.style.display = 'none';
                toast.style.transition = ''; // Clean up the transition
            }, { once: true });
        }, 3000);
    }
}