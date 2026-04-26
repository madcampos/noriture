// #region Images
const imageMimeTypes = {
	'image/jpeg': ['.jpg', '.jpeg'],
	'image/png': ['.png'],
	'image/gif': ['.gif'],
	'image/webp': ['.webp'],
	'image/svg+xml': ['.svg'],
	'image/vnd.microsoft.icon': ['.ico'],
	'image/bmp': ['.bmp'],
	'image/tiff': ['.tif', '.tiff']
} as const;

export type ImageMimeTypes = keyof typeof imageMimeTypes;
export type ImageExtensions = typeof imageMimeTypes[ImageMimeTypes][number];

const imageExtensions: Record<ImageExtensions, ImageMimeTypes> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.ico': 'image/vnd.microsoft.icon',
	'.bmp': 'image/bmp',
	'.tif': 'image/tiff',
	'.tiff': 'image/tiff'
} as const;

export const ImageMaps = {
	mimeType: imageMimeTypes,
	extension: imageExtensions
} as const;
// #endregion

// #region Text
const textMimeTypes = {
	'text/plain': ['.txt'],
	'text/html': ['.htm', '.html'],
	'text/css': ['.css'],
	'text/csv': ['.csv'],
	'text/markdown': ['.md']
} as const;

export type TextMimeTypes = keyof typeof textMimeTypes;
export type TextExtensions = typeof textMimeTypes[TextMimeTypes][number];

const textExtensions: Record<TextExtensions, TextMimeTypes> = {
	'.txt': 'text/plain',
	'.htm': 'text/html',
	'.html': 'text/html',
	'.css': 'text/css',
	'.csv': 'text/csv',
	'.md': 'text/markdown'
} as const;

export const TextMaps = {
	mimeType: textMimeTypes,
	extension: textExtensions
} as const;
// #endregion

// #region Audio
const audioMimeTypes = {
	'audio/mpeg': ['.mp3'],
	'audio/wav': ['.wav'],
	'audio/ogg': ['.ogg'],
	'audio/aac': ['.aac'],
	'audio/flac': ['.flac'],
	'audio/mp4': ['.m4a']
} as const;

export type AudioMimeTypes = keyof typeof audioMimeTypes;
export type AudioExtensions = typeof audioMimeTypes[AudioMimeTypes][number];

const audioExtensions: Record<AudioExtensions, AudioMimeTypes> = {
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.ogg': 'audio/ogg',
	'.aac': 'audio/aac',
	'.flac': 'audio/flac',
	'.m4a': 'audio/mp4'
} as const;

export const AudioMaps = {
	mimeType: audioMimeTypes,
	extension: audioExtensions
} as const;
// #endregion

// #region Video
export const videoMimeTypes = {
	'video/mp4': ['.mp4'],
	'video/webm': ['.webm'],
	'video/ogg': ['.ogv'],
	'video/x-msvideo': ['.avi'],
	'video/quicktime': ['.mov']
} as const;

export type VideoMimeTypes = keyof typeof videoMimeTypes;
export type VideoExtensions = typeof videoMimeTypes[VideoMimeTypes][number];

const videoExtensions: Record<VideoExtensions, VideoMimeTypes> = {
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.ogv': 'video/ogg',
	'.avi': 'video/x-msvideo',
	'.mov': 'video/quicktime'
} as const;

export const VideoMaps = {
	mimeType: videoMimeTypes,
	extension: videoExtensions
} as const;
// #endregion

// #region  Documents
export const documentMimeTypes = {
	'application/pdf': ['.pdf'],
	'application/msword': ['.doc'],
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
	'application/vnd.ms-excel': ['.xls'],
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
	'application/vnd.ms-powerpoint': ['.ppt'],
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
} as const;

export type DocumentMimeTypes = keyof typeof documentMimeTypes;
export type DocumentExtensions = typeof documentMimeTypes[DocumentMimeTypes][number];

const documentExtensions: Record<DocumentExtensions, DocumentMimeTypes> = {
	'.pdf': 'application/pdf',
	'.doc': 'application/msword',
	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.xls': 'application/vnd.ms-excel',
	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'.ppt': 'application/vnd.ms-powerpoint',
	'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
} as const;

export const DocumentMaps = {
	mimeType: documentMimeTypes,
	extension: documentExtensions
} as const;
// #endregion

// #region All Mime Types/Extensions
export type Extensions = ImageExtensions | TextExtensions | AudioExtensions | VideoExtensions | DocumentExtensions;
export type MimeTypes = ImageMimeTypes | TextMimeTypes | AudioMimeTypes | VideoMimeTypes | DocumentMimeTypes;

export const MimeMap = {
	...imageMimeTypes,
	...textMimeTypes,
	...audioMimeTypes,
	...videoMimeTypes,
	...documentMimeTypes
} as const;
export const ExtensionMap = {
	...imageExtensions,
	...textExtensions,
	...audioExtensions,
	...videoExtensions,
	...documentExtensions
} as const;

export const CategoryMap = {
	/* oxlint-disable typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion */
	...Object.fromEntries(Object.keys(imageMimeTypes).map((mime) => [mime, 'image'] as [ImageMimeTypes, 'image'])),
	...Object.fromEntries(Object.keys(textMimeTypes).map((mime) => [mime, 'text'] as [TextMimeTypes, 'text'])),
	...Object.fromEntries(Object.keys(audioMimeTypes).map((mime) => [mime, 'audio'] as [AudioMimeTypes, 'audio'])),
	...Object.fromEntries(Object.keys(videoMimeTypes).map((mime) => [mime, 'video'] as [VideoMimeTypes, 'video'])),
	...Object.fromEntries(Object.keys(documentMimeTypes).map((mime) => [mime, 'document'] as [DocumentMimeTypes, 'document']))
	/* oxlint-enable typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion */
} as const;

export const MEDIA_TYPES = ['image', 'text', 'audio', 'video', 'document', 'executable', 'unknown', 'embedded'] as const;

export type MediaType = typeof MEDIA_TYPES[number];

export function getMediaTypeFromMime(mimeType?: string) {
	const typeFromMime: MediaType | undefined = CategoryMap[mimeType ?? ''];

	return typeFromMime;
}

export function getMimeTypeFromExtension(url: string) {
	return Object.entries(ExtensionMap).find(([extension]) => url.endsWith(extension))?.[1];
}
