$old = "const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' }]"

$new = "const LANGUAGES = [{ code: 'EN-GB', name: 'English (UK)' },{ code: 'EN-US', name: 'English (US)' },{ code: 'ES', name: 'Spanish' },{ code: 'ES-419', name: 'Spanish (Latin America)' },{ code: 'FR', name: 'French' },{ code: 'DE', name: 'German' },{ code: 'IT', name: 'Italian' },{ code: 'PT-BR', name: 'Portuguese (Brazil)' },{ code: 'PT-PT', name: 'Portuguese (Portugal)' },{ code: 'ZH', name: 'Chinese (Simplified)' },{ code: 'JA', name: 'Japanese' },{ code: 'KO', name: 'Korean' },{ code: 'AR', name: 'Arabic' },{ code: 'RU', name: 'Russian' },{ code: 'HI', name: 'Hindi' },{ code: 'TR', name: 'Turkish' },{ code: 'NL', name: 'Dutch' },{ code: 'PL', name: 'Polish' },{ code: 'SV', name: 'Swedish' },{ code: 'DA', name: 'Danish' },{ code: 'FI', name: 'Finnish' },{ code: 'NB', name: 'Norwegian' },{ code: 'EL', name: 'Greek' },{ code: 'CS', name: 'Czech' },{ code: 'SK', name: 'Slovak' },{ code: 'RO', name: 'Romanian' },{ code: 'HU', name: 'Hungarian' },{ code: 'BG', name: 'Bulgarian' },{ code: 'UK', name: 'Ukrainian' },{ code: 'ID', name: 'Indonesian' },{ code: 'VI', name: 'Vietnamese' },{ code: 'TH', name: 'Thai' },{ code: 'HE', name: 'Hebrew' },{ code: 'ET', name: 'Estonian' },{ code: 'LV', name: 'Latvian' },{ code: 'LT', name: 'Lithuanian' },{ code: 'SL', name: 'Slovenian' }]"

$files = @("app\dashboard\DubVideo.tsx", "app\watch\page.tsx")

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    if ($content.Contains($old)) {
        $updated = $content.Replace($old, $new)
        Set-Content -Path $file -Value $updated -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "WARNING: Old LANGUAGES array not found exactly in $file - no changes made. Check manually." -ForegroundColor Yellow
    }
}
