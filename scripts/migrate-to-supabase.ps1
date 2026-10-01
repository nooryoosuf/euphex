# Migrates bundled JSON content to Supabase. Rerunnable (upserts).
# Usage: $env:SUPABASE_SERVICE_KEY="<service_role>"; ./scripts/migrate-to-supabase.ps1
# Rotate the service key after use.
$ErrorActionPreference = "Stop"
$SB = "https://enqzxycnnwyfzerohjdv.supabase.co"
$Key = $env:SUPABASE_SERVICE_KEY
if (-not $Key) { throw "Set SUPABASE_SERVICE_KEY first." }
$H = @{ apikey = $Key; Authorization = "Bearer $Key"; Prefer = "resolution=merge-duplicates" }

function Send-Row($table, $row, $onConflict, $label) {
  $body = ($row | ConvertTo-Json -Depth 10 -Compress)
  $uri = "$SB/rest/v1/${table}?on_conflict=${onConflict}"
  try {
    Invoke-RestMethod -Method Post -Uri $uri -Headers $H -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
    return $true
  } catch {
    Write-Output "FAIL ${table}/${label}: $($_.Exception.Message)"
    return $false
  }
}

function Rename($obj, $map) {
  $out = [ordered]@{}
  foreach ($p in $obj.PSObject.Properties) {
    $k = if ($map.ContainsKey($p.Name)) { $map[$p.Name] } else { $p.Name }
    $out[$k] = $p.Value
  }
  return $out
}

$root = Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "src") "data"
$playerMap = @{ realName = "real_name"; secondaryRole = "secondary_role"; teamSlug = "team_slug"; countryCode = "country_code"; winRate = "win_rate"; signatureMove = "signature_move"; favoriteHero = "favorite_hero"; heroPool = "hero_pool" }
$matchMap = @{ tournamentSlug = "tournament_slug"; tournamentName = "tournament_name"; teamSlug = "team_slug"; opponentShort = "opponent_short"; scoreUs = "score_us"; scoreThem = "score_them"; statLines = "stat_lines" }
$tournMap = @{ endDate = "end_date"; prizePool = "prize_pool"; teamSlugs = "team_slugs" }
$teamMap = @{ shortName = "short_name" }
$newsMap = @{ readMinutes = "read_minutes" }

$n = 0
$fail = 0
foreach ($p in (Get-Content (Join-Path $root "players.json") -Raw -Encoding UTF8 | ConvertFrom-Json)) { if (Send-Row "players" (Rename $p $playerMap) "slug" $p.slug) { $n++ } else { $fail++ } }
foreach ($t in (Get-Content (Join-Path $root "teams.json") -Raw -Encoding UTF8 | ConvertFrom-Json)) { if (Send-Row "teams" (Rename $t $teamMap) "slug" $t.slug) { $n++ } else { $fail++ } }
foreach ($m in (Get-Content (Join-Path $root "matches.json") -Raw -Encoding UTF8 | ConvertFrom-Json)) { if (Send-Row "matches" (Rename $m $matchMap) "id" $m.id) { $n++ } else { $fail++ } }
foreach ($t in (Get-Content (Join-Path $root "tournaments.json") -Raw -Encoding UTF8 | ConvertFrom-Json)) { if (Send-Row "tournaments" (Rename $t $tournMap) "slug" $t.slug) { $n++ } else { $fail++ } }
$content = Get-Content (Join-Path $root "content.json") -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($a in $content.news) { if (Send-Row "news" (Rename $a $newsMap) "slug" $a.slug) { $n++ } else { $fail++ } }
foreach ($m in $content.media) { if (Send-Row "media" $m "id" $m.id) { $n++ } else { $fail++ } }
# timeline has synthetic id â€” replace fully for rerun safety
Invoke-RestMethod -Method Delete -Uri "$SB/rest/v1/timeline?id=gte.0" -Headers $H -ContentType "application/json" | Out-Null
foreach ($e in $content.timeline) {
  $body = (@{ year = $e.year; title = $e.title; text = $e.text } | ConvertTo-Json -Compress)
  try {
    Invoke-RestMethod -Method Post -Uri "$SB/rest/v1/timeline" -Headers $H -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
    $n++
  } catch {
    Write-Output "FAIL timeline/$($e.title): $($_.Exception.Message)"
    $fail++
  }
}
Write-Output "Migrated $n rows, $fail failed."


