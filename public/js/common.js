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
    try {
        document.getElementById('userListWrap').classList.remove("hide");
    
        const searchUserName = document.getElementById('searchUserName').value;

        let userList = [],
            userListHtml = ''

        if(searchUserName.length >= 2) {
            response = await axios.post(`/account/getUserList`, {
                searchUserName: searchUserName
            });
            userList = response.data;
        }

        if(!userList.length) {
            userListHtml  = `<p class="empty">검색 결과가 존재하지 않습니다.</p>`;
        }else {
            for(let data of userList) {
                userListHtml += `
                    <a href="/summoner/${data.gameName}-${data.tagLine}" class="userWrap">
                        <img class="userIcon" src="https://deeplol-ddragon-cdn.deeplol.gg/cdn/14.24.1/img/profileicon/${ data.profileIconId }.png"/>
                        <img class="userTier" src="https://www.deeplol.gg/images/Emblem_${data.soloRankTier}.png"/>
                        <span class="userName">
                            <span class="name">${data.gameName}</span>
                            <span class="tag">#${data.tagLine}</span>
                        </span>
                    </a>
                `;
            }
        }

        document.getElementById('userList').innerHTML = userListHtml;
        
    } catch (err) {
        console.error(err);
    }
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