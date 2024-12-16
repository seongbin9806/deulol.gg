async function searchUser(event) {
    event.preventDefault();
    let searchUserName = document.querySelector('.userNameInput').value;

    // 이름#태그 형식을 확인하는 정규식
    const regex = /.+#.+/;
    if (!searchUserName || !regex.test(searchUserName)) {
        util.showToastMsg(`소환사명#태그 형식으로 입력해주세요.`);
        return;
    }

    searchUserName = searchUserName.replace('#', '-');
    location.href = `/summoner/${searchUserName}`;
}

async function getUserList() {
    document.getElementById('userListWrap').classList.remove("hide");
}

function closeUserListWrap() {
    document.getElementById('userListWrap').classList.add("hide");
}

// 문서 전체에서 클릭 이벤트를 감지
document.addEventListener('click', function(event) {
    // 클릭된 요소가 userListWrap이 아닌 경우에만 closeUserListWrap 함수를 실행
    if (!document.getElementById('userListWrap').contains(event.target) && 
        !document.getElementById('searchUserName').contains(event.target)) 
    {
        closeUserListWrap();
    }
});