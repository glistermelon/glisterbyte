export function reroute({ url }) {
    let domainParts = url.hostname.split('.');
    const subdomain = domainParts.length == 2 ? 'main' : domainParts[0];
    return '/' + subdomain + url.pathname;
}