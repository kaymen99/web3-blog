const fs = require('fs');

const dataPath = './posts.json'

function get() {
    try {
        const jsonData = fs.readFileSync(dataPath)
        return jsonData
    } catch (error) {
        return {}
    }
}

const save = (id, data) => {
    if (!fs.existsSync(dataPath)) {
        const posts = {}
        posts[id] = data
        const jsonData = JSON.stringify(posts)
        fs.writeFileSync(dataPath, jsonData);
    } else {
        var posts = get()
        posts = JSON.parse(posts)
        posts[id] = data
        const jsonData = JSON.stringify(posts)
        fs.writeFileSync(dataPath, jsonData)
    }
}

module.exports = {
    get,
    save
}