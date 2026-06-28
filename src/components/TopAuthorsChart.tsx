import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Writer, Article } from '../types';
import { Award, Eye, Coins, TrendingUp } from 'lucide-react';

interface TopAuthorsChartProps {
  writers: Writer[];
  articles: Article[];
}

interface AuthorStat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  totalReads: number;
  lifetimeEarnings: number;
}

export const TopAuthorsChart: React.FC<TopAuthorsChartProps> = ({ writers, articles }) => {
  const [metric, setMetric] = useState<'reads' | 'earnings'>('reads');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // 1. Process data: Aggregate reads from articles for each writer
  const stats: AuthorStat[] = writers.map(writer => {
    const writerArticles = articles.filter(a => a.writerId === writer.id && a.status === 'published');
    const totalReads = writerArticles.reduce((sum, art) => sum + (art.reads || 0), 0);
    const lifetimeEarnings = writer.lifetime_coins || writer.coinBalance || 0;
    
    return {
      id: writer.id,
      name: writer.name,
      username: writer.username,
      avatar: writer.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      totalReads,
      lifetimeEarnings
    };
  });

  // Sort stats according to chosen metric and take top 7
  const sortedStats = [...stats]
    .sort((a, b) => metric === 'reads' ? b.totalReads - a.totalReads : b.lifetimeEarnings - a.lifetimeEarnings)
    .slice(0, 7);

  // ResizeObserver to make chart responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Maintain minimum width of 280px, dynamically scale up
      const finalWidth = Math.max(width, 280);
      setDimensions({
        width: finalWidth,
        height: 380
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || sortedStats.length === 0) return;

    // Clear previous elements
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 40, bottom: 50, left: 140 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale
    const xMax = d3.max(sortedStats, d => metric === 'reads' ? d.totalReads : d.lifetimeEarnings) || 10;
    const xScale = d3.scaleLinear()
      .domain([0, xMax * 1.05]) // add some padding to the right
      .range([0, width]);

    // Y scale
    const yScale = d3.scaleBand()
      .domain(sortedStats.map(d => d.name))
      .range([0, height])
      .padding(0.3);

    // Color gradients
    const defs = svg.append("defs");
    
    // Reads gradient (Indigo)
    const readsGradient = defs.append("linearGradient")
      .attr("id", "reads-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    readsGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#6366f1");
    readsGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4f46e5");

    // Earnings gradient (Amber/Gold)
    const earningsGradient = defs.append("linearGradient")
      .attr("id", "earnings-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    earningsGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fbbf24");
    earningsGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f59e0b");

    const activeGradientId = metric === 'reads' ? 'url(#reads-gradient)' : 'url(#earnings-gradient)';

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(5, width / 80))
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    // Add grid lines for X axis
    chartGroup.append("g")
      .attr("class", "grid-lines text-slate-100")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(Math.min(5, width / 80))
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#f1f5f9"));

    // Draw bars with rounded corners (using custom path or standard rect with rx)
    const bars = chartGroup.selectAll(".bar")
      .data(sortedStats)
      .enter()
      .append("rect")
      .attr("class", "bar cursor-pointer transition-all duration-300")
      .attr("y", d => yScale(d.name) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("rx", 6) // Beautiful rounded bars
      .attr("ry", 6)
      .attr("fill", activeGradientId)
      .style("opacity", 0.95);

    // Animation transition on width
    bars.transition()
      .duration(800)
      .attr("width", d => xScale(metric === 'reads' ? d.totalReads : d.lifetimeEarnings));

    // Interactive Hover effects
    bars.on("mouseover", function(event, d) {
      d3.select(this)
        .style("opacity", 1)
        .attr("stroke", metric === 'reads' ? "#312e81" : "#78350f")
        .attr("stroke-width", 1.5);
      
      // Update custom HTML Tooltip or use an overlay
      const valueText = metric === 'reads' 
        ? `${d.totalReads.toLocaleString()} বার পঠিত`
        : `${d.lifetimeEarnings.toLocaleString()} কয়েন অর্জিত`;

      tooltip
        .style("visibility", "visible")
        .html(`
          <div class="flex items-center gap-2 p-2 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-lg text-xs">
            <img src="${d.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-600" />
            <div>
              <div class="font-extrabold">${d.name}</div>
              <div class="text-[10px] text-slate-400">@${d.username}</div>
              <div class="font-bold text-amber-400 mt-0.5">${valueText}</div>
            </div>
          </div>
        `);
    })
    .on("mousemove", function(event) {
      // Position tooltip relative to the SVG container
      const [x, y] = d3.pointer(event, svg.node());
      tooltip
        .style("left", `${x + 15}px`)
        .style("top", `${y - 20}px`);
    })
    .on("mouseout", function() {
      d3.select(this)
        .style("opacity", 0.95)
        .attr("stroke", "none");
      tooltip.style("visibility", "hidden");
    });

    // Add labels at the end of each bar
    chartGroup.selectAll(".value-label")
      .data(sortedStats)
      .enter()
      .append("text")
      .attr("class", "value-label font-mono font-black text-[11px] text-slate-700")
      .attr("y", d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr("x", d => xScale(metric === 'reads' ? d.totalReads : d.lifetimeEarnings) + 6)
      .text(d => {
        const val = metric === 'reads' ? d.totalReads : d.lifetimeEarnings;
        return val > 0 ? val.toLocaleString() : "০";
      })
      .style("opacity", 0)
      .transition()
      .delay(400)
      .duration(500)
      .style("opacity", 1);

    // Draw X Axis
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "x-axis text-slate-500 font-mono text-[10px]")
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"));

    // Draw Y Axis with avatars or custom styling
    const yAxisGroup = chartGroup.append("g")
      .attr("class", "y-axis text-slate-800 font-bold text-xs")
      .call(yAxis);
    
    yAxisGroup.select(".domain").remove(); // Remove axis line for minimal look
    
    yAxisGroup.selectAll("text")
      .attr("class", "cursor-pointer hover:text-indigo-600 transition-colors")
      .style("font-size", "11px");

    // Add X-Axis Label
    chartGroup.append("text")
      .attr("class", "x-label text-slate-500 text-[10px] font-bold text-center")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .style("text-anchor", "middle")
      .text(metric === 'reads' ? "📊 সর্বমোট পঠন সংখ্যা (বার)" : "🪙 সর্বমোট অর্জিত কয়েন সংখ্যা (কয়েন)");

    // Tooltip reference inside D3
    const tooltip = d3.select("#d3-authors-tooltip");

  }, [sortedStats, metric, dimensions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-6">
      {/* Header section with Stats Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            সেরা লেখকদের পরিসংখ্যান (D3.js চার্ট)
          </h3>
          <p className="text-xs text-slate-500">
            পাঠকদের পঠন সংখ্যা ও আজীবন উপার্জিত কয়েন দ্বারা লেখক র‍্যাংকিং।
          </p>
        </div>

        {/* Toggle metric */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setMetric('reads')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'reads'
                ? 'bg-indigo-650 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            পঠন সংখ্যা
          </button>
          <button
            onClick={() => setMetric('earnings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === 'earnings'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            কয়েন উপার্জন
          </button>
        </div>
      </div>

      {/* Grid of quick summary bento cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Top Read Author */}
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">শীর্ষ পঠিত লেখক</div>
            <div className="font-extrabold text-slate-900 text-xs">
              {stats.length > 0 ? [...stats].sort((a,b) => b.totalReads - a.totalReads)[0]?.name : 'লোডিং...'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {stats.length > 0 ? [...stats].sort((a,b) => b.totalReads - a.totalReads)[0]?.totalReads.toLocaleString() : '0'} বার পঠিত
            </div>
          </div>
        </div>

        {/* Card 2: Highest Earner */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">শীর্ষ উপার্জনকারী</div>
            <div className="font-extrabold text-slate-900 text-xs">
              {stats.length > 0 ? [...stats].sort((a,b) => b.lifetimeEarnings - a.lifetimeEarnings)[0]?.name : 'লোডিং...'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {stats.length > 0 ? [...stats].sort((a,b) => b.lifetimeEarnings - a.lifetimeEarnings)[0]?.lifetimeEarnings.toLocaleString() : '0'} কয়েন
            </div>
          </div>
        </div>

        {/* Card 3: Total Writers */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">মোট নিবন্ধিত লেখক</div>
            <div className="font-extrabold text-slate-900 text-xs">
              {writers.length} জন কলামিস্ট
            </div>
            <div className="text-[10px] text-slate-400">সক্রিয়ভাবে অবদান রাখছেন</div>
          </div>
        </div>
      </div>

      {/* Interactive D3 Chart Canvas container */}
      <div 
        ref={containerRef} 
        className="relative bg-slate-50/50 rounded-2xl border border-slate-100 p-2 sm:p-4 overflow-hidden"
      >
        {/* Tooltip Overlay */}
        <div 
          id="d3-authors-tooltip" 
          className="absolute z-50 pointer-events-none transition-all duration-100" 
          style={{ visibility: 'hidden' }}
        />

        {sortedStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 py-10">
            <p className="text-slate-400 text-xs font-semibold italic">কোনো লেখক তথ্য পাওয়া যায়নি।</p>
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            className="w-full h-auto select-none overflow-visible"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>

      {/* Dynamic ranking breakdown list */}
      <div className="space-y-3 pt-2">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          🏅 শীর্ষ {sortedStats.length} লেখকের বিস্তারিত তালিকা:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedStats.map((stat, idx) => (
            <div key={stat.id} className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl hover:shadow-2xs transition-shadow">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-sm text-indigo-600/80 w-5">#{idx + 1}</span>
                <img src={stat.avatar} alt={stat.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="font-black text-slate-900 text-xs">{stat.name}</div>
                  <div className="text-[10px] text-slate-400">@{stat.username}</div>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                {metric === 'reads' ? (
                  <div className="font-bold text-indigo-650 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{stat.totalReads.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="font-bold text-amber-500 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{stat.lifetimeEarnings.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
