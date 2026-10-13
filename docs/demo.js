(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const ns = 'http://www.w3.org/2000/svg';
  const makeSVG = (name, attrs) => {
    const element = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const graph = $('#idea-graph');
  const canvas = $('#idea-canvas');
  let data;
  let byId;
  let order;
  let activeId;
  let mode = 'walkthrough';
  let focusConnections = false;
  let query = '';
  let drag = null;
  const secondsPerIdea = 1500;
  let elapsed = 0;
  let playing = false;
  let speed = 1;
  let frameId = null;
  let lastFrame = null;
  let inView = !('IntersectionObserver' in window);
  let userPaused = false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const displayTitle = node => node.title;
  const insightFor = node => node.insight || '';
  const totalDuration = () => (data?.nodes.length || 0) * secondsPerIdea;
  const formatTime = ms => Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  const updatePlayback = () => {
    const total = totalDuration();
    const exploring = mode === 'explore';
    $('#idea-player').classList.toggle('is-playing', playing);
    $('#idea-player').classList.toggle('is-exploring', exploring);
    $('#idea-mode-walkthrough').setAttribute('aria-pressed', String(!exploring));
    $('#idea-mode-explore').setAttribute('aria-pressed', String(exploring));
    $('#idea-graph-heading').textContent = exploring ? 'THE COMPLETE GRAPH' : 'THE EVOLVING GRAPH';
    $('#idea-play-instruction').textContent = exploring ? 'Click a node to focus its connections; click it again to show the full graph.' : 'Click any node to pause and read its proposal.';
    $('#idea-play-icon').textContent = playing ? 'Ⅱ' : '▶';
    $('#idea-play-label').textContent = exploring ? 'Play walkthrough' : playing ? 'Pause' : elapsed >= total ? 'Replay' : 'Play';
    $('#idea-play').setAttribute('aria-label', exploring ? 'Play walkthrough from the saved position' : playing ? 'Pause walkthrough' : elapsed >= total ? 'Replay walkthrough' : 'Play walkthrough');
    $('#idea-play-status').textContent = exploring ? 'Full graph · explore connections' : elapsed >= total ? 'Walkthrough complete' : playing ? 'Playing · proposal walkthrough' : 'Paused · explore any idea';
    $('#idea-elapsed').textContent = formatTime(elapsed);
    $('#idea-duration').textContent = formatTime(total);
    $('#idea-seek').max = String(total);
    $('#idea-seek').value = String(elapsed);
    $('#idea-seek').style.setProperty('--play-progress', (total ? 100 * elapsed / total : 0) + '%');
    const index = data ? Math.min(data.nodes.length - 1, Math.floor(elapsed / secondsPerIdea)) : 0;
    $('#idea-seek').setAttribute('aria-valuetext', 'Idea ' + (index + 1) + ' of ' + (data?.nodes.length || 0) + ', ' + formatTime(elapsed) + ' into the walkthrough');
    if (activeId) $('#idea-play-caption').textContent = 'IDEA ' + record(byId.get(activeId)) + ' / ' + data.nodes.length;
  };
  const stopFrame = () => {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    frameId = null;
    lastFrame = null;
  };
  const canAnimate = () => mode === 'walkthrough' && playing && inView && !document.hidden;
  const tick = timestamp => {
    frameId = null;
    if (!canAnimate()) { lastFrame = null; return; }
    if (lastFrame !== null) elapsed = Math.min(totalDuration(), elapsed + Math.min(250, timestamp - lastFrame) * speed);
    lastFrame = timestamp;
    const index = Math.min(data.nodes.length - 1, Math.floor(elapsed / secondsPerIdea));
    if (data.nodes[index].id !== activeId) selectNode(data.nodes[index].id, false, true);
    if (elapsed >= totalDuration()) { playing = false; stopFrame(); refreshGraph(); }
    updatePlayback();
    if (canAnimate()) frameId = window.requestAnimationFrame(tick);
  };
  const scheduleFrame = () => {
    if (frameId === null && canAnimate()) frameId = window.requestAnimationFrame(tick);
  };
  const pausePlayback = (manual = true) => {
    playing = false;
    if (manual) userPaused = true;
    stopFrame();
    if (data) { refreshGraph(); updatePlayback(); }
  };
  const startPlayback = () => {
    if (!data) return;
    userPaused = false;
    const wasExploring = mode === 'explore';
    mode = 'walkthrough';
    if (wasExploring && elapsed < totalDuration()) selectNode(data.nodes[Math.floor(elapsed / secondsPerIdea)].id, false, true);
    if (elapsed >= totalDuration()) { elapsed = 0; selectNode(data.nodes[0].id, false, true); }
    playing = true;
    focusConnections = false;
    query = '';
    $('#idea-search').value = '';
    $('#idea-search-results').hidden = true;
    view = {x: 0, y: 0, width: 1000, height: 580};
    setView();
    refreshGraph();
    updatePlayback();
    scheduleFrame();
  };
  let view = {x: 0, y: 0, width: 1000, height: 580};
  const record = node => String(order.get(node.id) + 1).padStart(2, '0');
  const nodeGroups = new Map();
  const edgePaths = [];

  const setView = () => {
    graph.setAttribute('viewBox', `${view.x} ${view.y} ${view.width} ${view.height}`);
    $('#idea-zoom-level').textContent = Math.round(100000 / view.width) + '%';
  };
  const zoom = factor => {
    pausePlayback();
    const width = Math.max(220, Math.min(1800, view.width * factor));
    const height = width * 0.58;
    view = {x: view.x + (view.width - width) / 2, y: view.y + (view.height - height) / 2, width, height};
    setView();
  };
  const hideTooltip = () => { $('#idea-tooltip').hidden = true; };
  const showTooltip = (node, event) => {
    const box = canvas.getBoundingClientRect();
    const bounds = nodeGroups.get(node.id).getBoundingClientRect();
    const x = event && Number.isFinite(event.clientX) ? event.clientX : bounds.x + bounds.width / 2;
    const y = event && Number.isFinite(event.clientY) ? event.clientY : bounds.y;
    const tooltip = $('#idea-tooltip');
    $('#idea-tooltip-id').textContent = 'IDEA ' + record(node);
    $('#idea-tooltip-title').textContent = displayTitle(node);
    tooltip.style.left = Math.max(12, Math.min(box.width - 262, x - box.left + 16)) + 'px';
    tooltip.style.top = Math.max(10, Math.min(box.height - 100, y - box.top - 66)) + 'px';
    tooltip.hidden = false;
  };

  const refreshGraph = () => {
    const neighbors = new Set([activeId]);
    data.edges.forEach(edge => {
      if (edge.target === activeId) neighbors.add(edge.source);
      if (mode === 'explore' && edge.source === activeId) neighbors.add(edge.target);
    });
    nodeGroups.forEach((group, id) => {
      const node = byId.get(id);
      const matches = !query || (node.title + ' ' + node.plan + ' ' + node.rationale + ' ' + node.insight + ' ' + node.experiment).toLowerCase().includes(query);
      const dim = query ? !matches : focusConnections && !neighbors.has(id);
      group.classList.toggle('is-muted', dim);
      const future = mode === 'walkthrough' && order.get(id) > order.get(activeId);
      group.classList.toggle('is-upcoming', future);
      group.setAttribute('aria-hidden', String(future));
      group.setAttribute('tabindex', future ? '-1' : '0');
      group.classList.toggle('is-selected', id === activeId && (mode === 'walkthrough' || focusConnections));
      group.classList.toggle('is-neighbor', focusConnections && neighbors.has(id) && id !== activeId);
      group.setAttribute('aria-pressed', String(id === activeId && (mode === 'walkthrough' || focusConnections)));
    });
    edgePaths.forEach(({edge, path}) => {
      const linked = mode === 'explore' ? focusConnections && (edge.source === activeId || edge.target === activeId) : edge.target === activeId;
      path.classList.toggle('is-connected', linked);
      path.classList.toggle('is-upcoming', mode === 'walkthrough' && (order.get(edge.source) > order.get(activeId) || order.get(edge.target) > order.get(activeId)));
      path.classList.toggle('is-muted', query ? true : focusConnections && !linked);
    });
    $('#idea-focus').setAttribute('aria-pressed', String(focusConnections));
    $('#idea-focus').textContent = mode === 'explore' ?
      (focusConnections ? 'Show full graph' : 'Focus connections') :
      (focusConnections ? 'Show history' : 'Focus origins');
  };

  const proposalParts = node => {
    return {plan: node.plan || '', rationale: node.rationale || ''};
  };

  // Keep the recorded proposal, pre-run reasoning and post-run insight distinct.
  const renderPlan = node => {
    const parts = proposalParts(node);
    const copy = document.createElement('p');
    copy.textContent = parts.plan || 'No research plan recorded for this proposal.';
    $('#idea-plan').replaceChildren(copy);
    $('#idea-rationale-copy').textContent = parts.rationale || 'No rationale recorded for this proposal.';
    $('#idea-insight-copy').textContent = insightFor(node) || 'No insight recorded for this proposal.';
    $('.idea-inspector-scroll').scrollTop = 0;
  };

  const renderScore = node => {
    const container = $('#idea-result');
    container.replaceChildren();
    const heading = document.createElement('span');
    heading.className = 'idea-result-label';
    heading.textContent = 'RECORDED val_bpb · LOWER IS BETTER';
    const row = document.createElement('div');
    row.className = 'idea-result-row';
    const score = document.createElement('strong');
    score.textContent = Number.isFinite(node.score) ? node.score.toFixed(6) : 'Not recorded';
    row.appendChild(score);
    const parents = data.edges.filter(edge => edge.target === node.id && edge.type === 'direct')
      .map(edge => byId.get(edge.source)).filter(parent => Number.isFinite(parent?.score));
    container.append(heading, row);
    if (!Number.isFinite(node.score) || !parents.length) {
      const note = document.createElement('p');
      note.textContent = Number.isFinite(node.score) ? 'No direct-parent baseline is supplied.' : 'No numeric result is supplied for this proposal.';
      container.appendChild(note);
    } else parents.forEach(parent => {
      const delta = node.score - parent.score;
      const improved = delta < -0.0000005;
      const regressed = delta > 0.0000005;
      const item = document.createElement('div');
      item.className = 'idea-result-change ' + (improved ? 'is-improved' : regressed ? 'is-regressed' : 'is-unchanged');
      const badge = document.createElement('span');
      badge.className = 'idea-delta';
      badge.textContent = (improved ? '↓ ' : regressed ? '↑ +' : '= ') + (improved ? '−' + Math.abs(delta).toFixed(6) : Math.abs(delta).toFixed(6));
      const comparison = document.createElement('span');
      comparison.textContent = (improved ? 'Improved' : regressed ? 'Regressed' : 'Unchanged') + ' vs EXP ' + parent.experiment + ' (' + parent.score.toFixed(6) + ')';
      item.append(badge, comparison);
      container.appendChild(item);
    });
    $('#idea-experiment').textContent = 'EXP ' + node.experiment;
  };

  const selectNode = (id, focus = true, fromPlayback = false) => {
    const node = byId.get(id);
    if (!node) return;
    if (!fromPlayback) { pausePlayback(); if (mode === 'walkthrough') elapsed = order.get(id) * secondsPerIdea; }
    activeId = id;
    focusConnections = focus;
    query = '';
    $('#idea-search').value = '';
    $('#idea-search-results').hidden = true;
    $('#idea-record').textContent = 'IDEA ' + record(node);
    $('#idea-proposal-title').textContent = displayTitle(node);
    $('#idea-position').textContent = (order.get(id) + 1) + ' / ' + data.nodes.length;
    $('#idea-map-help').textContent = mode === 'explore' ? 'Idea ' + record(node) + ' · incoming and outgoing connections' : 'Idea ' + record(node) + ' selected · drag to pan';
    $('#idea-previous').disabled = order.get(id) === 0;
    $('#idea-next').disabled = order.get(id) === data.nodes.length - 1;
    renderPlan(node);
    renderScore(node);
    if (fromPlayback && !reducedMotion) $('.idea-inspector').animate?.([{opacity: 0.4, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: Math.min(450, secondsPerIdea / speed * 0.35), easing: 'ease-out'});
    hideTooltip();
    refreshGraph();
    updatePlayback();
    // Keep a newly selected idea visible after a zoom or pan.
    if (node.x < view.x + 15 || node.x > view.x + view.width - 15 || node.y < view.y + 15 || node.y > view.y + view.height - 15) {
      view.x = node.x - view.width / 2;
      view.y = node.y - view.height / 2;
      setView();
    }
  };

  const activateNode = id => {
    if (id === activeId && focusConnections && !query) {
      pausePlayback();
      focusConnections = false;
      hideTooltip();
      refreshGraph();
      $('#idea-map-help').textContent = mode === 'explore' ?
        'Full graph · select a node to highlight its connections' :
        'Explored history · select a node to focus its origins';
      return;
    }
    selectNode(id);
  };

  const setMode = nextMode => {
    if (!data || nextMode === mode) return;
    pausePlayback();
    mode = nextMode;
    focusConnections = false;
    query = '';
    $('#idea-search').value = '';
    $('#idea-search-results').hidden = true;
    hideTooltip();
    view = {x: 0, y: 0, width: 1000, height: 580};
    setView();
    if (mode === 'walkthrough') {
      const index = Math.min(data.nodes.length - 1, Math.floor(elapsed / secondsPerIdea));
      selectNode(data.nodes[index].id, false, true);
    } else {
      $('#idea-map-help').textContent = 'Full graph · select a node to highlight its connections';
      refreshGraph();
      updatePlayback();
    }
  };
  $('#idea-mode-walkthrough').addEventListener('click', () => setMode('walkthrough'));
  $('#idea-mode-explore').addEventListener('click', () => setMode('explore'));

  const edgePath = (source, target, type) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const sx = source.x + dx / length * 11;
    const sy = source.y + dy / length * 11;
    const tx = target.x - dx / length * 12;
    const ty = target.y - dy / length * 12;
    const bend = type === 'reference' ? Math.min(22, length * 0.08) : Math.min(10, length * 0.035);
    return `M${sx} ${sy} Q${(sx + tx) / 2 - dy / length * bend} ${(sy + ty) / 2 + dx / length * bend} ${tx} ${ty}`;
  };

  const render = source => {
    data = source;
    byId = new Map(data.nodes.map(node => [node.id, node]));
    // Keep the reviewed experiment order used by the walkthrough.
    order = new Map(data.nodes.map((node, i) => [node.id, i]));
    $('#idea-count').textContent = data.nodes.length;
    $('#idea-link-count').textContent = data.edges.length;
    data.edges.forEach(edge => {
      if (!byId.has(edge.source) || !byId.has(edge.target)) return;
      const path = makeSVG('path', {d: edgePath(byId.get(edge.source), byId.get(edge.target), edge.type), class: 'idea-edge is-' + edge.type, 'marker-end': 'url(#idea-arrow)'});
      $('#idea-edges').appendChild(path);
      edgePaths.push({edge, path});
    });
    data.nodes.forEach(node => {
      const group = makeSVG('g', {class: 'idea-node', transform: `translate(${node.x} ${node.y})`, tabindex: '0', role: 'button', 'aria-label': 'Idea ' + record(node) + ': ' + displayTitle(node), 'aria-pressed': 'false', 'data-node-id': node.id});
      group.append(makeSVG('circle', {class: 'idea-hit', r: '17'}), makeSVG('circle', {class: 'idea-ring', r: '12'}), makeSVG('circle', {class: 'idea-core', r: '9'}));
      const label = makeSVG('text', {class: 'idea-node-number', y: '3'});
      label.textContent = record(node);
      group.appendChild(label);
      group.addEventListener('click', () => activateNode(node.id));
      group.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateNode(node.id); }
      });
      group.addEventListener('pointerenter', event => { if (!drag) showTooltip(node, event); });
      group.addEventListener('pointerleave', hideTooltip);
      group.addEventListener('focus', () => showTooltip(node));
      group.addEventListener('blur', hideTooltip);
      nodeGroups.set(node.id, group);
      $('#idea-nodes').appendChild(group);
    });
    selectNode(data.nodes[0].id, false, true);
    data.nodes.forEach((node, i) => {
      const mark = document.createElement('i');
      mark.style.left = (100 * i / data.nodes.length) + '%';
      $('#idea-timeline-ticks').appendChild(mark);
    });
    if (!reducedMotion && inView && !userPaused) startPlayback();
  };

  $('#idea-search').addEventListener('input', () => {
    if (!data) return;
    pausePlayback();
    query = $('#idea-search').value.trim().toLowerCase();
    const results = $('#idea-search-results');
    results.replaceChildren();
    results.hidden = !query;
    if (query) {
      const matches = data.nodes.filter(node => (node.title + ' ' + node.plan + ' ' + node.rationale + ' ' + node.insight + ' ' + node.experiment).toLowerCase().includes(query));
      const count = document.createElement('p');
      count.textContent = matches.length ? matches.length + ' matching ideas' : 'No matching ideas. Try another research term.';
      results.appendChild(count);
      matches.forEach(node => {
        const button = document.createElement('button');
        button.type = 'button';
        const number = document.createElement('span');
        number.textContent = record(node);
        const title = document.createElement('strong');
        title.textContent = displayTitle(node);
        button.append(number, title);
        button.addEventListener('click', () => { selectNode(node.id); $('#idea-search').focus(); });
        results.appendChild(button);
      });
    }
    refreshGraph();
  });
  $('#idea-search').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      $('#idea-search').value = '';
      query = '';
      $('#idea-search-results').hidden = true;
      if (data) refreshGraph();
    } else if (event.key === 'ArrowDown') {
      const first = $('#idea-search-results button');
      if (first) { event.preventDefault(); first.focus(); }
    }
  });
  $('#idea-search-results').addEventListener('keydown', event => {
    const buttons = Array.from($('#idea-search-results').querySelectorAll('button'));
    const index = buttons.indexOf(event.target);
    if (index >= 0 && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length].focus();
    }
    if (event.key === 'Escape') { $('#idea-search-results').hidden = true; $('#idea-search').focus(); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.idea-search-wrap')) $('#idea-search-results').hidden = true;
  });
  $('#idea-focus').addEventListener('click', () => {
    if (!data) return;
    pausePlayback();
    focusConnections = !focusConnections;
    refreshGraph();
  });
  $('#idea-previous').addEventListener('click', () => {
    if (data && order.get(activeId) > 0) selectNode(data.nodes[order.get(activeId) - 1].id);
  });
  $('#idea-next').addEventListener('click', () => {
    if (data && order.get(activeId) < data.nodes.length - 1) selectNode(data.nodes[order.get(activeId) + 1].id);
  });
  $('#idea-zoom-in').addEventListener('click', () => zoom(0.78));
  $('#idea-zoom-out').addEventListener('click', () => zoom(1.28));
  $('#idea-fit').addEventListener('click', () => { pausePlayback(); view = {x: 0, y: 0, width: 1000, height: 580}; setView(); });
  graph.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoom(event.deltaY > 0 ? 1.08 : 0.92); }
  }, {passive: false});
  graph.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('.idea-node')) return;
    pausePlayback();
    const box = graph.getBoundingClientRect();
    const scale = Math.max(view.width / box.width, view.height / box.height);
    drag = {x: event.clientX, y: event.clientY, originX: view.x, originY: view.y, scale};
    graph.setPointerCapture(event.pointerId);
    graph.classList.add('is-dragging');
    hideTooltip();
  });
  graph.addEventListener('pointermove', event => {
    if (!drag) return;
    view.x = drag.originX - (event.clientX - drag.x) * drag.scale;
    view.y = drag.originY - (event.clientY - drag.y) * drag.scale;
    setView();
  });
  const endDrag = () => { drag = null; graph.classList.remove('is-dragging'); };
  graph.addEventListener('pointerup', endDrag);
  graph.addEventListener('pointercancel', endDrag);
  graph.addEventListener('lostpointercapture', endDrag);
  graph.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(0.78); }
    if (event.key === '-') { event.preventDefault(); zoom(1.28); }
    if (event.target === graph && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      pausePlayback();
      view.x += event.key === 'ArrowLeft' ? -35 : event.key === 'ArrowRight' ? 35 : 0;
      view.y += event.key === 'ArrowUp' ? -35 : event.key === 'ArrowDown' ? 35 : 0;
      setView();
    }
  });

  $('#idea-play').addEventListener('click', () => playing ? pausePlayback() : startPlayback());
  $('#idea-restart').addEventListener('click', () => {
    if (!data) return;
    pausePlayback();
    mode = 'walkthrough';
    elapsed = 0;
    selectNode(data.nodes[0].id, false, true);
    startPlayback();
  });
  $('#idea-speed').addEventListener('change', () => {
    const nextSpeed = Number($('#idea-speed').value);
    if ([0.25, 0.5, 1, 2, 4, 8].includes(nextSpeed)) speed = nextSpeed;
    $('#idea-speed').value = String(speed);
    $('#idea-speed').setAttribute('aria-label', 'Playback speed: ' + speed + '×');
  });
  $('#idea-seek').addEventListener('input', () => {
    if (!data) return;
    const seekValue = Number($('#idea-seek').value);
    pausePlayback();
    mode = 'walkthrough';
    elapsed = Math.max(0, Math.min(totalDuration(), seekValue));
    const index = Math.min(data.nodes.length - 1, Math.floor(elapsed / secondsPerIdea));
    selectNode(data.nodes[index].id, false, true);
  });
  $('.idea-inspector-scroll').addEventListener('wheel', () => pausePlayback(), {passive: true});
  $('.idea-inspector-scroll').addEventListener('pointerdown', () => pausePlayback());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFrame();
    else scheduleFrame();
  });
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) {
        if (data && !reducedMotion && !userPaused && elapsed === 0) startPlayback();
        else scheduleFrame();
      } else stopFrame();
    }, {threshold: 0.15});
    observer.observe($('#idea-player'));
  }
  $('#idea-player').addEventListener('keydown', event => {
    // Native controls retain their own keyboard behavior.
    if (event.key === ' ' && (event.target === graph || event.target === $('#idea-player'))) {
      event.preventDefault();
      playing ? pausePlayback() : startPlayback();
    }
  });

  const load = () => {
    try {
      if (!window.NANOGPT_IDEA_GRAPH) throw new Error('Could not load graph');
      render(window.NANOGPT_IDEA_GRAPH);
    } catch (error) {
      $('#idea-proposal-title').textContent = 'Research graph unavailable';
      $('#idea-map-help').textContent = 'Reload the page to try loading the research graph again.';
      console.error(error);
    }
  };
  load();
})();
