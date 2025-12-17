async function checkUserRoles() {
    if (!State.votingSystem || !State.userAddress) return;

    try {
        State.userRoles.admin = await State.votingSystem.hasRole(CONFIG.ROLES.ADMIN_ROLE, State.userAddress);
        State.userRoles.founder = await State.votingSystem.hasRole(CONFIG.ROLES.FOUNDER_ROLE, State.userAddress);

        const rolesText = [];
        if (State.userRoles.admin) rolesText.push('ADMIN');
        if (State.userRoles.founder) rolesText.push('FOUNDER');
        if (rolesText.length === 0) rolesText.push('VOTANT');

        document.getElementById('user-roles').textContent = rolesText.join(', ');

        document.getElementById('admin-section').style.display = State.userRoles.admin ? 'block' : 'none';
        document.getElementById('founder-section').style.display = State.userRoles.founder ? 'block' : 'none';
        
        const winnerSection = document.getElementById('winner-section');
        if (winnerSection && winnerSection.style.display !== 'none') {
            document.getElementById('determine-winner').style.display = State.userRoles.admin ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des rôles:', error);
    }
}

window.checkUserRoles = checkUserRoles;

